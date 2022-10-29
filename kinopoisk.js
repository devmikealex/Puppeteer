console.log()
console.log('-СТАРТ-')

const fs = require('fs')
const puppeteer = require('puppeteer')
const clc = require('cli-color')

let page, browser
// const sleep = duration => new Promise(resolve => setTimeout(resolve, duration));

const titles = fs.readFileSync('kino.txt').toString().split('\r\n')
;(async function () {
    browser = await puppeteer.launch({
        headless: false,
        // devtools: true,
        // slowMo: 30,
        args: ['--window-size=1400,900', '--window-position=1821,10'],
    })

    for (const i in titles) {
        console.log()
        // console.log('*', i, ' - ' , links[i])
        const msg = `* ${i}/${titles.length - 1} - ${titles[i]}`
        if (titles[i].includes('/')) {
            console.log(clc.green(msg))
            const title = titles[i].slice(0, titles[i].indexOf('/')).trim()
            console.log('title:', title)
            await getData(title)
            console.log(clc.yellow(' - Pause - '))
            await sleep(3000)
        } else {
            console.log(clc.blackBright(msg))
        }
    }

    console.log(clc.yellowBright('FINISH'))
    // await browser.close()
})()

async function getData(title) {
    console.log('-----------------')
    page = await browser.newPage()
    await page.setViewport({ width: 1200, height: 800 })

    page.on('console', (msg) => {
        for (let i = 0; i < msg.args().length; ++i) console.log(`${i}: ${msg.args()[i]}`)
    })

    const URL = `https://www.kinopoisk.ru/index.php?kp_query=${title}`
    await page.goto(URL)
    console.log('Ссылка:', clc.magentaBright(URL))

    title = await page.title()
    console.log(clc.blue(title))

    let rating = '',
        imdb = '',
        mainPage = false,
        searchPage = false

    await page
        .waitForSelector('.search_results', { timeout: 2000 })
        .then(() => {
            searchPage = true
        })
        .catch((err) => {
            mainPage = true
            console.error(err.message)
        })
    // .finally(() => {
    //     console.log('Experiment completed')
    // })

    // if (mainPage) {
    // }

    if (searchPage) {
        await page.click('#block_left_pad > div > div:nth-child(3) > div > p > a')
        await page.waitForNavigation()
        title = await page.title()
        console.log(clc.blue(title))
    }

    rating = await getTextFromEl('.film-rating-value')
    console.log('rating:', rating)
    imdb = await getTextFromEl('.film-sub-rating')
    imdb = imdb.slice(5, 9)
    console.log('imdb:', imdb)

    // page.waitForSelector('div[class*="styles_abbreviated__"]', { timeout: 5000 })
    //     .then(() => {
    //         page.evaluate(() => {
    //             let headers = document.querySelectorAll(
    //                 'div[class*="styles_abbreviated__"]'
    //             )
    //             console.log('HEADERS TYPE 1', headers)
    //             if (headers) {
    //                 headers.forEach((header) => {
    //                     console.log('HEADER', header)
    //                     header.remove()
    //                 })
    //             }
    //         })
    //     })
    //     .catch((err) => {
    //         console.error(err.message)
    //     })

    const styles = [
        'h1{background:#be0000; color:yellow !important;padding:12px;}',
        '.header-navigation{display: none;}',
        'div[class*="styles_background"]{display: none;}',
        'div[class*="styles_abbreviated"]{display: none;}',
        'div[class*="styles_videoContainer"]{margin-top: 2px !important;}',
        'div[class*="styles_basicInfoSection"]{padding-top: 2px !important;}',
    ]
    await page.addStyleTag({ content: styles.join(' ') })

    await page.evaluate(
        (title, rating, imdb) => {
            document.title = `${rating} ${imdb} ${title}`
            const titleOnPage = document.getElementsByTagName('h1')
            console.log('titleOnPage', titleOnPage[0])
            if (titleOnPage[0]) titleOnPage[0].innerHTML += `<br>${rating}<br>IMDB: ${imdb}`

            // headers = document.querySelectorAll('div[class*="styles_background__"]')
            // console.log('HEADERS TYPE 2', headers)
            // if (headers) {
            //     headers.forEach((header) => {
            //         console.log('HEADER', header)
            //         header.remove()
            //     })
            // }
        },
        title,
        rating,
        imdb
    )

    // document.querySelectorAll('div[class*="styles_main__"]')

    // page.evaluateOnNewDocument(()=>{
    //     var style = document.createElement('style')
    //     style.type = 'text/css'
    //     style.innerHTML = 'h1{background: red; color: yellow;}'
    //     document.getElementsByTagName('head')[0].appendChild(style)
    // })
    // await page.close()
}

async function getTextFromEl(selector) {
    let text = '-'
    let success = false
    await page
        .waitForSelector(selector, { timeout: 5000 })
        .then(() => {
            success = true
        })
        .catch((e) => {
            console.log('FAIL', e)
        })
    if (success) {
        text = await page.$eval(selector, (el) =>
            el.textContent.trim().replace(/ +(?= )/g, '')
        )
    }
    return text
}

function sleep(duration) {
    return new Promise((resolve) => setTimeout(resolve, duration))
}