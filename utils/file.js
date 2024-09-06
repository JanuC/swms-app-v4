// 文件操作
export default {
	/**
	 * @param {Object} fileName 文件名
	 */
	getFileEntry(fileName) {
		return new Promise((resolve) => {
			plus.io.requestFileSystem(plus.io.PRIVATE_DOC, function(fs) {
				fs.root.getFile(fileName, {
					create: true
				}, function(fileEntry) {
					resolve(fileEntry);
				});
			});
		})
	},
	/**
	 * 获取文件
	 * @param {Object} fileEntry
	 */
	getFile(fileEntry) {
		return new Promise(async (resolve) => {
			fileEntry.file(function(file) {
				resolve(file);
			});
		})
	},
	// 写入文件内容
	writeFileContext(fileEntry, data) {
		return new Promise(async (resolve, reject) => {
			fileEntry.createWriter(function(writer) {
				writer.seek(0);
				writer.write(JSON.stringify(data));
				resolve(writer)
			}, function(e) {
				reject(e)
			});
		})
	},
	/**
	 * 获取文件内容
	 * @param {Object} file
	 */
	getFileContext(file) {
		let fileReader = new plus.io.FileReader();
		fileReader.readAsText(file, 'utf-8');
		return new Promise((resolve) => {
			fileReader.onloadend = function(evt) {
				resolve(evt.target.result)
			}
		});
	},
}
