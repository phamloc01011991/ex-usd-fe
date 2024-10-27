<script setup>
import { onMounted, ref, reactive, defineProps } from 'vue'
import request from '../../../utils/request'
import { formatUsdt, usdToVnd, formatVnd, vndToUsd } from '../../../utils/money'
import SupportDepoint from './SupportDepoint.vue';
import { languagePack } from '../../../languages';
import  SupportInvite from '../home/supportInvite.vue'
let resultData = reactive({})
const priceUSD = ref()
const amount = ref(0)
const noty = ref('0')
const emit = defineEmits(['close-popup'])
const bankData = ref('')
const amountUsd = ref()
const err_depoint = ref('')
const err_depoint1_check = ref(false)
const err_depoint1 = ref('Bạn có lệnh mua USD đang chờ duyệt.')
const theme = ref(localStorage.getItem('theme') || 'dark');
const showSupportDepoint = ref(false);
const listWallet = ref(false)
const selecNetwork =  ref('')
const networkDefaul = ref('')
const isCopyToClipBoardSucces = ref(false)
async function getPriceUSD() {
  var reponse = await fetch('https://api.exchangerate-api.com/v4/latest/USDT')
  var data = await reponse.json()
  priceUSD.value = data.rates.VND
}

const code = ref('')
const datetime = ref('')
async function depointAmount() {
  document.getElementsByClassName('btn button')[0].disabled = true;
  err_depoint.value = ''
  err_depoint1_check.value = false
  if (amount.value < 10) {
    err_depoint.value = languagePack.person_depoint_err1
    document.getElementsByClassName('btn button')[0].disabled = '';
    return
  }
  if (amount.value > 3000000) {
    err_depoint.value = languagePack.person_depoint_err2
    document.getElementsByClassName('btn button')[0].disabled = '';
    return
  }
  const list = await request.get('user/get_trans_history', {
    params: {
      typeTransaction: 'toup'
    }
  })
  if (list.data.data.length > 0 && list.data.data[0].status == 'pending') {
    err_depoint1_check.value = true
    document.getElementsByClassName('btn button')[0].disabled = '';
    return
  }
  var res = await request.post('user/topup-trans', {
    amount: amount.value,
    network: display.value == 2 ? networkSelect.value : null
  })
  var result = res.data
  amountUsd.value = (await vndToUsd(amount.value)).toFixed(3)
  noty.value = result
  code.value = result.transaction.code
  datetime.value = result.transaction.createdAt
}

function changeDate(inputDateTime = "") {
        // Tạo đối tượng Date từ chuỗi đầu vào
    const dateObj = new Date(inputDateTime);
    // Cộng thêm 7 giờ
    dateObj.setUTCHours(dateObj.getUTCHours() + 7);
    // Lấy thông tin giờ, phút và giây
    const hours = dateObj.getUTCHours();
    const minutes = dateObj.getUTCMinutes();
    const seconds = dateObj.getUTCSeconds();
    // Lấy ngày, tháng và năm
    const day = dateObj.getUTCDate();
    const month = dateObj.getUTCMonth() + 1; // Lưu ý: Tháng trong JavaScript bắt đầu từ 0, nên cần cộng thêm 1
    const year = dateObj.getUTCFullYear();
    // Tạo chuỗi kết quả
    const outputDateTime = `${day
        .toString()
        .padStart(2, "0")}-${month.toString().padStart(2, "0")}-${year} ${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")} `;
    // console.log(outputDateTime); // Kết quả: 07:22:58 24-05-2023
    return outputDateTime;
}

function onReady(token) {
  if(display.value !== 2) {
    display.value = 2
  }
  var qrcode 
  setTimeout(()=> {
    qrcode = new QRCode(document.getElementById('id_qrcode'), {
    width: 250,
    height: 250
  });
  qrcode.makeCode(token);
  }, 500)
  
}

// function copyClipboard(textToCopy) {
//   if (!navigator.clipboard) {
//     errNoti.text = languagePack.depoint_err2;
//     errNoti.status = 'error'
//     isCopyToClipBoardSucces.value = true
//       setTimeout(() => {
//         isCopyToClipBoardSucces.value = false
//       }, 3000);
//   } else {
//     // Sao chép nội dung vào bộ nhớ đệm
//     navigator.clipboard.writeText(textToCopy).then(function () {
     
//       errNoti.text = languagePack.depoint_err3
//       errNoti.status = 'success'
//       isCopyToClipBoardSucces.value = true
//       setTimeout(() => {
//         isCopyToClipBoardSucces.value = false
//       }, 3000);
//     });
//   }
// }

function copyClipboard(textToCopy) {
    if (!navigator.clipboard) {
    console.log("Trình duyệt không hỗ trợ API clipboard.");
} else {
    // Sao chép nội dung vào bộ nhớ đệm
    navigator.clipboard.writeText(textToCopy)
        .then(function() {
          isCopyToClipBoardSucces.value = true
        })
}
}

const networkSelect = ref('');
const adressSelect = ref('')

async function getListWallet() {
  let res = await request.get('admin/wallet-admin')
  listWallet.value = res.data.data
  networkSelect.value = listWallet.value[0].network
  adressSelect.value = listWallet.value[0].adress
}

function changeNetwork() {
  let nt = listWallet.value.find(item => item.network === networkSelect.value);
  adressSelect.value = nt.adress;
  document.getElementById('id_qrcode').innerHTML = '';
  onReady(adressSelect.value)

}



const closePopup = () => {
  if (display.value == 1) {
    emit('close-popup')
  } else {
    display.value = 1
  }
}
const closePopup1 = () => {
  emit('close-popup')
}


const display = ref(1);

onMounted(() => {
  //get bank
  
  getPriceUSD()
  getListWallet()
  // document.getElementsByClassName("btn-login")[0].setAttribute('disabled', false);
})
</script>
<template>
  <div class="popbuy" :data-theme="theme">
    <div :class="[noty == 0 ? 'popbuy-content' : 'popbuy-content result-content']">
      <div class="top">
        <div class="ct">
          <div class="back"><i class='bx bx-left-arrow-alt' @click="closePopup"></i></div>
          <h4>{{ languagePack.person_depoint_title }}</h4>
        </div>
      </div>
      <div class="pre" v-if="display == 1">
        <h3>{{ languagePack.person_depoint_title1 }}</h3>
        <div class="otp" @click="onReady(adressSelect)">
          <div class="bank">Tether(USDT)</div>
          <div class="note">
            <div>{{ languagePack.person_depoint_time }}</div>
            <div>{{ languagePack.person_depoint_fee }}: 0 %</div>
            <div>{{ languagePack.person_depoint_min }}</div>
            <div>{{ languagePack.person_depoint_max }}</div>
          </div>
        </div>
        <div class="otp" @click="display = 3">
          <div class="bank">Internet Banking</div>
          <div class="note">
            <div>{{ languagePack.person_depoint_time }}</div>
            <div>{{ languagePack.person_depoint_fee }}: 0 %</div>
            <div>{{ languagePack.person_depoint_min }}</div>
            <div>{{ languagePack.person_depoint_max }}</div>
          </div>
        </div>
      </div>
      <div class="popbuy-center otp1" v-if="display == 2" > 
        <div class="center-time">
          <div class="network">
            <span for="">{{ languagePack.person_depoint_network }}</span>
            <select @change="changeNetwork" v-model="networkSelect" style="text-transform: uppercase;">
              <option v-for="(item, index) in listWallet" :value="item.network" :key="index">
                {{ item.network }}
              </option>
            </select>
          </div>
          <div class="form-control">
            <label for="">{{ languagePack.person_depoint_amount }}</label>
            <div class="form-input">
              <input placeholder="USD"  type="number" v-model="amount"/>
            </div>
            
          </div>
          <div class="price">1 USDT ≈ 1 USD <i @click="showSupportDepoint = true" class='bx bx-help-circle' ></i></div>

          <div class="qr_code" id="id_qrcode" ></div>
          <div class="address">
            <div class="left">
              <span class="title">{{ languagePack.person_depoint_address }} <i class='bx bx-chevron-right'></i></span>
              <p class="ad">
                {{ adressSelect }}
              </p>
            </div>
            <div class="right">
              <span @click="copyClipboard(adressSelect)">{{ languagePack.person_depoint_copy }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="popbuy-center otp2" v-if="display == 3">
        <div class="center-time">
          <div class="form-input">
            <div class="form-control">
              <input placeholder="USD"  type="number" v-model="amount"/>
            </div>
          </div>
          <p class="sub"><span>{{ languagePack.person_depoint_sub_recieve }}≈</span>{{ formatUsdt(amount / priceUSD) }} USD</p>
        </div>
      </div>
      <div class="f" v-if="display != 1">
        <p class="form-err">{{ err_depoint }}</p>
        <p class="form-err" v-if="err_depoint1_check">{{ err_depoint1 }}</p>
        <div class="note">
          <div>{{ languagePack.person_depoint_time }}</div>
          <div>{{ languagePack.person_depoint_fee }}: 0 %</div>
          <div>{{ languagePack.person_depoint_min }}</div>
          <div>{{ languagePack.person_depoint_max }}</div>
        </div>
        <div class="center-confirm">
          <button class="btn button" @click="depointAmount()">
            {{ languagePack.person_depoint_btndepoint }}
          </button>
        </div>
      </div>
      <div class="notifi-done" v-if="noty != 0">
        <div class="noti-sc">
          <i class='bx bx-check-circle' ></i>
          <p class="noty">{{ languagePack.person_depoint_done_noti1 }}. <br>{{ languagePack.person_depoint_done_noti2 }} ! </p>
          <div class="detail">
            <div class="item">
              <span class="left">{{ languagePack.person_depoint_done_time }}</span>
              <span class="right">{{ changeDate(datetime) }} </span>
            </div>
            <div class="item">
              <span class="left">{{ languagePack.person_depoint_done_code }}</span>
              <span class="right">{{ code }}</span>
            </div>
          </div>
          <div class="money">
            <button class="" @click="closePopup1()">
              {{ languagePack.person_depoint_done_close }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <SupportDepoint v-if="showSupportDepoint" @close-popup="showSupportDepoint = false"/>
    <SupportInvite v-if="isCopyToClipBoardSucces" @close-popup="isCopyToClipBoardSucces = false"/>
  </div>
</template>
<style scoped>
/* pre */
.pre {
  padding-inline: 12px;
}
.pre h3 {
  margin-bottom: 15px;
  margin-top: 20px;
}
.pre .bank {
  border-bottom: 1px solid var(--border-color);
  padding: 12px;
  font-weight: 600;
}
.pre .otp {
  border: 1px solid var(--border-color);
  border-radius: 5px;
  margin-bottom: 30px;
}
.pre .note {
  color: var(--text-color) !important;
}
/* otp2 */
.otp2 .form-control {
  display: inline-block;
  position: relative;
  width: 100%;
}
.otp2 .form-input {
  margin-bottom: 5px;
  border-radius: 3px;
  text-align: center;
}
.otp2 input {
  background: none;
  border: none;
  outline: none;
  font-size: 45px;
  font-weight: 800;
  color: var(--text-color);
  display: inline-block;
  width: 100%;
  text-align: center;
  max-width: 100%;
}
.popbuy-center.otp2 {
  margin-top: 40px;
    border-radius: 5px;
    padding: 40px 10px;
    background: var(--background-input);
    margin-inline: 12px;
}
/*  */
.address {
  margin-top: 10px;
  background-color: var(--background-overall);
  padding: 20px;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.address .left p{
  word-wrap: break-word;
  word-break: break-all;
  white-space: normal; 
  overflow-wrap: break-word; 
}
.address .left {
  width: 60%;
}
.address .right span{
  display: inline-block;
  background-color: var(--background-input);
  padding: 5px 10px;
  border-radius: 15px;
}
.address .title {
  display: block;
  margin-bottom: 5px;
  color: var(--text-sub-color);
}
.address .title i{
  vertical-align: middle;
  font-size: 16px;
}

.detail {
  margin-bottom: 20px;
  margin-top: 30px;
}
.network {
  text-align: center;
}
select {
  background: none;
  padding: 0 5px;
  outline: none;
  letter-spacing: 0.6px;
  border: none;
  color: var(--text-color);
  font-size: 16px;
  font-weight: 600;

}
.network span {
  display: block;
  font-size: 16px;
  color: var(--text-sub-color);
  margin-bottom: 3px;
}

.detail .item {
  display: flex;
  justify-content: space-between;
  margin-block: 10px;
}
.detail .item .left {
color: var(--text-sub-color);
}
.img {
  width: 64px;
  height: 64px;
  margin-bottom: 15px;
}

/* noti */
.notifi-done {
  width: 100%;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.4);
}

.noti-sc {
  position: absolute;
  bottom: 0px;
  left: 0px;
  right: 0px;
  text-align: center;
  background-color: var(--background-sub);
  min-height: 325px;
  border-radius: 5px 5px 0 0;
  padding: 25px 12px 45px 12px;
  z-index: 999999999;
}



.money button {
  display: block;
  color: var(--text-color);
  border: 1px solid var(--text-sub-color);
  height: 36px;
  line-height: 36px;
  width: 100%;
  text-align: center;
  border-radius: 5px;
  background: none;
  font-weight: 600;
}

.noty {
  line-height: 25px;
}

/*  */
.popbuy {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100vh;
  min-height: 100vh;
  padding-bottom: 75px;
  z-index: 99999;
  overflow-y: scroll;
  background: var(--background-color);
  overflow-x: hidden;
  color: var(--text-color);
}

.popbuy-content {

  position: relative;
}

.popbuy-content .top {
  padding: 40px 12px 5px 12px;
  background: var(--background-sub);
}

.popbuy-content .top .ct {
  position: relative;
}

.popbuy-content .top .ct h4 {
  font-weight: 600;
  font-size: 17px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.popbuy-content .top .back {
  font-size: 25px;
}



.popbuy-center {
  margin-top: 40px;
  margin-inline: 12px;
}


.center-confirm .center-balence__btn {
  padding: 7px 30px;
  border: none;
}

h4 {
  padding: 0px 20px;
}



.form-input {
  position: relative;
  border-radius: 3px;
  background:var(--background-input);
  border-radius: 3px;
  padding-inline: 8px;
  margin-bottom: 10px;
}


.form-control {
  display: inline-block;
  position: relative;
  width: 100%;
}
.form-control label {
  display: block;
  margin-bottom: 5px;
  color: var(--text-sub-color);
}
input {
  background: none;
  border: none;
  width: 100%;
  outline: none;
  padding-block: 15px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-color);
  letter-spacing: 0.4px;
}
.form-control span {
  display: inline-block;
  position: absolute;
  bottom: 0;
  left: 100%;
  font-weight: 600;
  font-size: 13px;
}
#id_qrcode {
  margin-block: 30px;
  display: flex;
  justify-content: center;
}


.price {
  color: var(--text-sub-color);
  display: flex;
  align-items: center;
}
.price i {
  font-size: 18px;
  margin-left: 7px;
}
.note {
  padding: 12px;
  font-size: 13px;
  color: var(--text-sub-color);
}

.sub>span {
  color: var(--text-sub-color);
}
.sub {
  font-size: 12px;
  text-align: center;
}

.form-err {
  line-height: 25px;
  font-size: 13px;
  font-weight: 500;
  color: #f14545;
  transition: ease-in-out all 1s;
  padding-inline: 12px;
  margin-top: 10px;
}

.btn-login {
  border: none;
  padding: 10px 30px;
  width: 100%;
  font-weight: 600;
  border-radius: 17.5px;
  cursor: point;
  background-color: #00be06;
  color: #001a00;
}

.center-confirm {
  margin-top: 40px;
  margin-inline: 12px;
  
}
.center-confirm button {
  text-align: center;
  border-radius: 5px;
  height: 35px;
  line-height: 35px;
  font-weight: 700;
  display: block;
  width: 100%;
  border: none;
}
.noti-sc>i {
  font-size: 40px;
  color: #faa600;
  display: block;
  margin-bottom: 10px;
}
</style>
