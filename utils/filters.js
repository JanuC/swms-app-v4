/**
 * 过滤任务列表名称
 */
const filterName = (val) => {
	let pattern = new RegExp("[\u4E00-\u9FA5]+");
	let pattern1 = new RegExp("[A-Za-z0-9]+");
	let length = val.length;
	let actualLength = 0;
	for (var i = 0; i < length; i++) {
		if (pattern.test(val.charAt(i))) {
			actualLength += 2;
		} else if (pattern1.test(val.charAt(i))) {
			actualLength++;
		} else {
			actualLength++;
		}
	}
	if (actualLength > 20) {
		let position = val.lastIndexOf('-');
		let first = val.substring(0, 5);
		let last = val.substring(position+1, length);
		return first + '...' + last
	} else {
		return val;
	}
}
/**
 * 过滤任务列表时间
 */
const filterDate = (val) => {
	let dateArr = val.split(' ');
	return dateArr[0].replace(/-/g, '-');
}

const filterPoint = (val) => {
	if(!val) return '';
	if (val.length > 10) {
		return val.slice(0, 10) + '...';
	}
	return val;
}

export {
	filterName,
	filterDate,
	filterPoint
}
