import { hydrate, render } from 'solid-js/web'
import '@fontsource-variable/raleway/wght.css'
// 한글: 프리젠테이션 중 화면에 쓰는 글자만 담은 파일(pnpm fonts로 만듦)
import './styles/fonts/freesentation.css'
// 한글 큰 제목: 학교안심 별빛하늘 중 제목에 쓰는 글자만 담은 파일(제목이 화면에 나올 때 받음)
import './styles/fonts/byeolbichhaneul.css'
import './styles/global.css'
import restFontsCss from './styles/fonts/freesentation-rest.css?url'
import { App } from './App'
import { attachRestFonts } from './lib/attachRestFonts'

const root = document.getElementById('app')!
// 빌드 때 사전 렌더링한 HTML이 있으면 이어받고, 개발 서버에서는 새로 그림
if (root.firstElementChild) hydrate(() => <App />, root)
else render(() => <App />, root)
// 나머지 한글(화면 글자 파일에 없는 글자)은 첫 화면 뒤에 붙임
attachRestFonts(restFontsCss)
