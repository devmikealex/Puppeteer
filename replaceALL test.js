let title = 'Yuliya * Small | Дзен'
// t = t.replaceAll('*|', '')

title = title.replace(/[\\/:*?\"<>|]/g, '') // удаление не букв и не цифр
title = title.replace(/\s+/g, ' ') // удаление пробелов подряд
title = title.trim()

console.log(title);