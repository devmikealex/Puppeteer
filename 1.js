const puppeteer = require('puppeteer')

;(async function () {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--window-size=1400,900', '--window-position=1821,10'],
    })
    const page = await browser.newPage()
    await page.goto('http://127.0.0.1:3000/getgame.html')
    await page.setViewport({
        width: 1200,
        height: 800,
    })

    // await page.waitForSelector('')
    // await page.click('')

    // await page.screenshot({path: 't:/1.png'})

    const dimensions = await page.evaluate(() => {
        return {
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight,
            deviceScaleFactor: window.devicePixelRatio,
        }
    })

    console.log('Dimensions:', dimensions)

    await page.focus('#game-search')
    await page.keyboard.type('test54465465')

    // await page.focus('#game-search')
    await page.keyboard.press('Enter')

    await page.waitForSelector('#games-list .info')
    // await page.waitForTimeout(5000)

    // let element = await page.$('#games-list')
    // console.log("🚀 ~ file: 1.js ~ line 40 ~ element", element)
    // const value = await element.evaluate((el) => el.textContent)
    let value = await page.evaluate(() => {
        const el = document.getElementById('games-list')
        return Promise.resolve(el.textContent)
    })
    console.log('value1:', value)

    await page.waitForSelector('#games-list')
    let element = await page.$('#games-list')
    value = await page.evaluate(el => el.textContent, element)
    console.log('value2:', value)

    // await browser.close()
})()
