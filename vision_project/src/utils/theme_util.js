const theme = {
  chalk: {
    // 背景颜色
    backgroundColor: '#161522',
    backgroundColor2: 'rgb(34 40 51)',
    // 标题的文字颜色
    titleColor: '#ffffff',
    // 切换主题按钮的图片路径
    themeSrc: 'change_dark.png',
    // 页面顶部的边框图片
    headerBorderSrc: 'header_border_dark.png'

  },
  vintage: {
    // 背景颜色
    backgroundColor: '#eeeeee',
    backgroundColor2: '#fff',
    // 标题的文字颜色
    titleColor: '#000000',
    // 切换主题按钮的图片路径
    themeSrc: 'change_light.png',
    // 页面顶部的边框图片
    headerBorderSrc: 'header_border_light.png'
  }
}

export function getThemeValue (themeType) {
  return theme[themeType]
}
