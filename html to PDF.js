console.log()
console.log('-СТАРТ-')

// const fs = require('fs')
const puppeteer = require('puppeteer')
const clc = require('cli-color')

let page, browser
;(async function () {
    browser = await puppeteer.launch({
        headless: true,
        // args: ['--window-size=1400,900', '--window-position=1821,10'],
    })

    page = await browser.newPage()
    // await page.setViewport({ width: 1200, height: 800 })
    await page.goto('http://127.0.0.1:5500/index.html')
    let title = await page.title()
    console.log(clc.blue(title))
    title = title.replace(/[\\/:*?\"<>|]/g, '-') // удаление плохих символов
    title = title.replace(/\s+/g, ' ') // удаление пробелов подряд
    title = title.trim()
    console.log(clc.green(title))

    await page.pdf({
        path: `t:/${title}.pdf`,
        format: 'A4',
        printBackground: true,
        // margin: { left: '2cm', top: '4cm', right: '1cm', bottom: '2.5cm' }
    })

    await browser.close()
    console.log(clc.yellowBright('FINISH'))
})()
