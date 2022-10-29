console.log()
console.log('-СТАРТ-')

const fs = require('fs')
const puppeteer = require('puppeteer')
const clc = require('cli-color')

let page, browser

const links = fs.readFileSync('wb-urls.txt').toString().split('\r\n')
;(async function () {
    browser = await puppeteer.launch({
        headless: false,
        args: ['--window-size=1400,900', '--window-position=1821,10'],
    })

    const header = `Артикул	Наименование	Цена	Старая цена	Рейтинг	Отзывов	Продаж	Продавец	Рейтинг	Отзывов	Проданных товаров	Время	Товаров с браком	Ссылка`
    fs.writeFileSync('t:/data.csv', header + '\r\n', 'utf-8')

    for (const i in links) {
        console.log()
        // console.log('*', i, ' - ' , links[i])
        console.log(`* ${i}/${links.length} - ${links[i]}`)
        await getDataWB(links[i])
    }

    await browser.close()
})()

async function getDataWB(URL) {
    console.log('-----------------')
    page = await browser.newPage()
    await page.setViewport({ width: 1200, height: 800 })
    await page.goto(URL)

    const product = await getTextFromEl('h1')
    console.log('Продукт:', clc.yellowBright(product))
    const num = await getTextFromEl('#productNmId')
    console.log('Артикул:', clc.cyanBright(num))
    const cost = await getTextFromEl('.price-block__final-price')
    // console.log("Цена:", cost)
    const costOld = await getTextFromEl('.price-block__old-price')
    // console.log("Старая цена:", costOld)
    console.log(clc.redBright(`Цена: ${cost} - Старая цена ${costOld}`))

    // const rating = await getTextFromEl('.product-review__rating')

    await page.click('#comments_reviews_link')
    const rating = await getTextFromEl('.user-opinion__rating-numb')
    console.log('Рейтинг:', rating)
    const review = await getTextFromEl('.product-review__count-review')
    console.log('Количество отзывов:', review)
    const sales = await getTextFromEl('.product-order-quantity')
    console.log('Покупок:', sales)

    const sellerName = await getTextFromEl('.seller-info__name')
    // console.log("Продавец:", sellerName)
    const sellerRate = await getTextFromEl('.address-rate-mini')
    // console.log("Рейтинг:", sellerRate)
    const sellerReview = await getTextFromEl('.seller-info__review')
    // console.log("Покупок:", sellerReview)
    console.log(`Продавец: ${sellerName} - Рейтинг: ${sellerRate} - ${sellerReview}`)
    const sellerDeliv = await getTextFromEl('.seller-info__item--delivered')
    // console.log(sellerDeliv)
    const sellerTime = await getTextFromEl('.seller-info__item--time')
    const sellerDefect = await getTextFromEl('.seller-info__item--defective')
    // console.log(sellerDefect)
    console.log(`${sellerDeliv} - ${sellerDefect}`)
    console.log(sellerTime)

    console.log('Ссылка:', clc.magentaBright(URL))

    await page.close()

    const delimeter = '\t'
    const data = [
        num,
        product,
        cost,
        costOld,
        rating,
        review.replace(' отзыва', '').replace(' отзывов', '').replace(' отзыв', ''),
        sales.replace('Купили более ', '').replace(' раз', ''),
        sellerName,
        sellerRate,
        sellerReview.replace(' отзывов на товары', '').replace(' отзыв на товары', '').replace(' отзыва на товары', ''),
        sellerDeliv.replace(' проданных товаров', '').replace(' проданного товара', '').replace(' проданный товар', ''),
        sellerTime.replace(' продает на Wildberries', ''),
        sellerDefect.replace(' товаров с браком', ''),
        URL,
    ].join(delimeter)
    // console.log("DATA:", clc.cyanBright(data.replace('\t', ' - ')))
    
    fs.appendFileSync('t:/data.csv', data + '\r\n', 'utf-8')
}

async function getTextFromEl(selector) {
    let text = '-'
    let success = false
    await page
        .waitForSelector(selector, { timeout: 10000 })
        .then(() => {
            success = true
            // console.log('SUCCESS');
        })
        .catch((e) => {
            console.log('FAIL', e)
        })
    if (success) {
        text = await page.$eval(selector, (el) =>
            el.textContent.trim().replace(/ +(?= )/g, '')
        )
    }
    // console.log("getTextFromEl:", selector, ' = ', text)
    return text
}
