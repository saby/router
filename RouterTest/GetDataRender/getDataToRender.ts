export default function getDataToRender(url: string): Promise<{}> {
    return Promise.resolve({ url, from: 'getDataToRender' });
}
