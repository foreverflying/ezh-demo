export const nopFunc = () => { }

const suffix = ['th', 'st', 'nd', 'rd']

export const formatNumber = (num: number, locale?: string, original?: true): string => {
    let ret = locale ? num.toLocaleString(locale) : '' + num
    if (original) {
        const v = num % 100
        ret += (suffix[(v - 20) % 10] || suffix[v] || suffix[0])
    }
    return ret
}
