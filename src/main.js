
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { NavBar } from 'vant';
import { Tabbar, TabbarItem } from 'vant';
import { Button } from 'vant';
import 'vant/lib/index.css';
import { Form, Field, Popup, Icon,NoticeBar } from 'vant'
import { Cell, CellGroup } from 'vant';
import App from './App.vue'
import { RadioGroup, Radio } from 'vant';
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Tabbar);
app.use(TabbarItem);
app.use(NavBar);
// app.use(Dialog);
app.use(Cell);
app.use(CellGroup);
app.use(Form)
app.use(Button);
app.use(Field)
app.use(Popup)
app.use(Icon)
app.use(Radio);
app.use(RadioGroup);
app.use(NoticeBar)
app.mount('#app')
