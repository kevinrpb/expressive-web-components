import { html } from 'lit-html';

import SlideShow from '@expressive-wc/slide-show/slide-show.js'

import styles from './styles.css'

import img1 from "./img/1.jpg"
import img2 from "./img/2.jpg"
import img3 from "./img/3.jpg"
import img4 from "./img/4.jpg"
import img5 from "./img/5.jpg"

export default {
  title: 'Components/SlideShow'
}

const Tempalte = ({ interval }) => html`
<slide-show interval="${interval}">
  <img src="${img1}" index="" alt="">
  <img src="${img2}" index="" alt="">
  <img src="${img3}" index="" alt="">
  <img src="${img4}" index="" alt="">
  <img src="${img5}" index="" alt="">
</slide-show>
`
export const Default = Tempalte.bind({})
Default.args = {
  interval: 3000
}
