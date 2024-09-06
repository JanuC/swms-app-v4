// 包路径
const package_NdefRecord = 'android.nfc.NdefRecord';
const package_NdefMessage = 'android.nfc.NdefMessage';
const package_TECH_DISCOVERED = 'android.nfc.action.NDEF_DISCOVERED';
const package_Intent = 'android.content.Intent';
const package_Activity = 'android.app.Activity';
const package_PendingIntent = 'android.app.PendingIntent';
const package_IntentFilter = 'android.content.IntentFilter';
const package_NfcAdapter = 'android.nfc.NfcAdapter';
const package_Ndef = 'android.nfc.tech.Ndef';
const package_NdefFormatable = 'android.nfc.tech.NdefFormatable';
const package_Parcelable = 'android.os.Parcelable';
const package_String = 'java.lang.String';

let NfcAdapter;
let NdefRecord;
let NdefMessage;
let readyWriteData = false; // 开启写
let readyRead = false; // 开启读
let noNFC = false;
let techListsArray = [
	['android.nfc.tech.IsoDep'],
	['android.nfc.tech.NfcA'],
	['android.nfc.tech.NfcB'],
	['android.nfc.tech.NfcF'],
	['android.nfc.tech.Nfcf'],
	['android.nfc.tech.NfcV'],
	['android.nfc.tech.NdefFormatable'],
	['android.nfc.tech.MifareClassi'],
	['android.nfc.tech.MifareUltralight']
];
// 要写入的数据
let text = '{id:8888, name:nfc,stie: test}';
let readResult = '';
import store from '../store'
export default {
	listenNFCStatus: function() {
		let that = this;
		try {
			let main = plus.android.runtimeMainActivity();
			let Intent = plus.android.importClass('android.content.Intent');
			let Activity = plus.android.importClass('android.app.Activity');
			let PendingIntent = plus.android.importClass('android.app.PendingIntent');
			let IntentFilter = plus.android.importClass('android.content.IntentFilter');
			NfcAdapter = plus.android.importClass('android.nfc.NfcAdapter');
			let nfcAdapter = NfcAdapter.getDefaultAdapter(main);
			if (nfcAdapter == null) {
				uni.showToast({
					title: '设备不支持NFC！',
					icon: 'none'
				})
				noNFC = true;
				return;
			}
			if (!nfcAdapter.isEnabled()) {
				uni.showToast({
					title: '请在系统设置中先启用NFC功能！',
					icon: 'none'
				});
				noNFC = true;
				return;
			} else {
				noNFC = false;
			}
			let intent = new Intent(main, main.getClass());
			intent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
			let pendingIntent = PendingIntent.getActivity(main, 0, intent, 0);
			// let ndef = new IntentFilter("android.nfc.action.TECH_DISCOVERED");
			let ndef = new IntentFilter("android.nfc.action.NDEF_DISCOVERED");
			ndef.addDataType("*/*");
			let intentFiltersArray = [ndef];
			plus.globalEvent.addEventListener('newintent', function() {
				// console.log('newintent running');
				// 轮询调用 NFC
				return that.nfcRuning()
				// setTimeout(that.nfcRuning(), 1000);
			});
			plus.globalEvent.addEventListener('pause', function(e) {
				// console.log('pause running');
				if (nfcAdapter) {
					// 关闭前台调度系统
					// 恢复默认状态
					nfcAdapter.disableForegroundDispatch(main);
				}
			});
			plus.globalEvent.addEventListener('resume', function(e) {
				// console.log('resume running');
				if (nfcAdapter) {
					// 开启前台调度系统
					// 优于所有其他NFC
					nfcAdapter.enableForegroundDispatch(main, pendingIntent, intentFiltersArray,
						techListsArray);
				}
			});
			nfcAdapter.enableForegroundDispatch(main, pendingIntent, intentFiltersArray, techListsArray);
		} catch (e) {
			console.error(e);
		}
	},
	nfcRuning: function() {
		NdefRecord = plus.android.importClass("android.nfc.NdefRecord");
		NdefMessage = plus.android.importClass("android.nfc.NdefMessage");
		let main = plus.android.runtimeMainActivity();
		let intent = main.getIntent();
		let that = this;
		if (package_TECH_DISCOVERED == intent.getAction()) {
			// 	if (readyWriteData) {
			// 		console.log("----------我在写1-------------")
			// 		that.write(intent);
			// 		readyWriteData = false;
			// 	} else if (readyRead) {
			// 		console.log("----------我在读1-------------")
			return that.read(intent);
			// readyRead = false;
			// 	}
		}
	},
	write(intent) {
		console.log("----------我在写-------------")
		try {
			toast('请勿移开标签 正在写入...');
			console.log("text=" + text);
			let textBytes = plus.android.invoke(text, "getBytes");
			let textRecord = new NdefRecord(NdefRecord.TNF_MIME_MEDIA,
				plus.android.invoke("text/plain", "getBytes"),
				plus.android.invoke("", "getBytes"), textBytes);
			let message = new NdefMessage([textRecord]);
			let Ndef = plus.android.importClass('android.nfc.tech.Ndef');
			let NdefFormatable = plus.android.importClass('android.nfc.tech.NdefFormatable');
			let tag = intent.getParcelableExtra(NfcAdapter.EXTRA_TAG);
			let ndef = Ndef.get(tag);
			if (ndef != null) {
				// 待写入的数据长度
				let size = message.toByteArray().length;
				ndef.connect();
				if (!ndef.isWritable()) {
					toast('tag不允许写入！');
					return;
				}
				if (ndef.getMaxSize() < size) {
					toast('文件大小超出容量！');
					return;
				}
				ndef.writeNdefMessage(message);
				toast('写入数据成功！');
				return;
			} else {
				let format = NdefFormatable.get(tag);
				if (format != null) {
					try {
						format.connect();
						format.format(message);
						toast('格式化tag并且写入message');
						return;
					} catch (e) {
						toast('格式化tag失败.');
						return;
					}
				} else {
					toast('Tag不支持NDEF');
					return;
				}
			}
		} catch (e) {
			toast('写入失败');
			console.log("error=" + e);
		}
	},
	read(intent) {
		let that = this;
		// NFC id
		let bytesId = intent.getByteArrayExtra(NfcAdapter.EXTRA_ID);
		let nfc_id = that.byteArrayToHexString(bytesId);
		let Parcelable = plus.android.importClass("android.os.Parcelable");
		let rawmsgs = intent.getParcelableArrayExtra("android.nfc.extra.NDEF_MESSAGES");
		if (rawmsgs != null && rawmsgs.length > 0) {
			let records = rawmsgs[0].getRecords();
			let result = records[0].getPayload();
			let data = plus.android.newObject("java.lang.String", result);
			let	filterNfc = data.match(/\d+/g)[0];
			readResult = data;
			console.log(data, filterNfc)
			store.dispatch('app/setNfcData', filterNfc)
			return filterNfc;
		} else {
			toast('没有读取到数据');
		}
	},
	byteArrayToHexString: function(inarray) { // converts byte arrays to string  
		let i, j, inn;
		let hex = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
		let out = "";
		for (j = 0; j < inarray.length; ++j) {
			inn = inarray[j] & 0xff;
			i = (inn >>> 4) & 0x0f;
			out += hex[i];
			i = inn & 0x0f;
			out += hex[i];
		}
		return out;
	},
	writeData: function() {
		if (noNFC) {
			toast('请检查设备是否支持并开启 NFC 功能！');
			return;
		}
		// 轮询条件
		readyWriteData = true;
		toast('请将NFC标签靠近！');
	},
	readData: function() {
		if (noNFC) {
			toast('请检查设备是否支持并开启 NFC 功能！');
			return;
		}
		// 轮询条件
		readyRead = true;
		toast('请将NFC标签靠近！');
	}
}

function toast(content) {
	uni.showToast({
		title: content,
		icon: 'none'
	})
}
