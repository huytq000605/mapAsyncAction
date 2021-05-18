// Idea: Muốn thực hiện hàm map async song song với nhau và có limit
function *createGeneratorFromArray (arr: any[]) {
    for(let i = 0; i < arr.length; i++) {
        yield [arr[i], i, arr]
    }
}
/**
 * 
 * @param arr Array muốn truyền vào
 * @param fn Một hàm async muốn thực hiện với mỗi phần tử của mảng
 * @param limit Giới hạn số concurrency thực hiện (Default: Chạy tất cả)
 * @returns một mảng các kết quả theo tứ tự của mảng nhập vào
 */
const mapAsyncAction = async <T> (arr: T[], fn: (currentValue: T, index: number) => Promise<any>, limit = arr.length): Promise<T[]|any> => {
    const result = Array(arr.length);
    if(arr.length === 0) return [];
    limit = Math.min(arr.length, limit);
    let workers = []

    const generator = createGeneratorFromArray(arr)

    for(let i = 0; i < limit; i++) {
        workers.push(createWorker(generator, fn, result))
    }
    await Promise.all(workers);
    return result;
}

const createWorker = async (
    generator: Generator<Array<any>>,
    fn: (currentValue: any, index: number) => Promise<any>,
    result: any[]
) => {
    for (let gen of generator) {
        const currentValue = gen[0];
        const index = gen[1];
        result[index] = await fn(currentValue, index); // can custom: wrap this fn to return the result we want
    }
    return;
    /* 
    Distributed System
        return new Promise(async (resolve, reject) => {
            worker.on('finished', () => resolve())
        }) 
    */
};

export default mapAsyncAction;