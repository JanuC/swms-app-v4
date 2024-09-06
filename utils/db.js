import db from "@/config/index.js";
// SQLite操作
export default {
	/**
	 * 打开数据库
	 * @param {Object} options
	 * name: ( String ) 必选 数据库名称
	 * path: ( String ) 必选 数据库路径
	 */
	openDB(options) {
		return new Promise((resolve, reject) => {
			plus.sqlite.openDatabase({
				name: options.name,
				path: options.path,
				success: (e => {
					// console.log('打开数据库成功 ');
					resolve(true)
				}),
				fail: (e => {
					console.log('打开数据库失败: ' + JSON.stringify(e));
					reject(false)
				})
			});
		})
	},
	/**
	 * 关闭数据库
	 * @param {Object} name 
	 * name: ( String ) 必选 数据库名称
	 */
	closeDB(name) {
		plus.sqlite.closeDatabase({
			name: name,
			success: (e => {
				console.log('关闭数据库成功');
			}),
			fail: (e => {
				console.log('关闭数据库失败: ' + JSON.stringify(e));
			})
		});
	},
	/**
	 * 检查数据库是否打开
	 * @param {Object} options
	 * name: ( String ) 必选 数据库名称
	 * path: ( String ) 必选 数据库路径
	 */
	isOpenDB(options) {
		return new Promise((resolve, reject) => {
			if (plus.sqlite.isOpenDatabase(options)) {
				// console.log('数据库已打开');
				resolve(true)
			} else {
				resolve(false)
			}
		})
	},
	/**
	 * 查询
	 * @param {Object} options
	 * name: ( String ) 必选 数据库名称
	 * sql: ( String ) 必选 需要查询的SQL语句 => 'select * from database'
	 */
	selectSQL(sql) {
		return new Promise((resolve, reject) => {
			plus.sqlite.selectSql({
				name: db.dbName,
				sql: sql,
				success: (res => {
					// console.log('查询-SQL语句成功');
					resolve(res);
				}),
				fail: (e => {
					console.log('查询-SQL语句失败: ' + JSON.stringify(e));
					reject(JSON.stringify(e))
				})
			});
		})
	},
	/**
	 * 创建表
	 * @param {Object} options
	 */
	async createTable(options) {
		return new Promise((resolve, reject) => {
			plus.sqlite.executeSql({
				name: options.name,
				sql: options.sql,
				success: (e => {
					console.log('创建表-执行sql成功!');
					resolve(true)
				}),
				fail: (e => {
					console.log('创建表-执行sql失败: ' + JSON.stringify(e));
					reject(false)
				})
			});
		})
	},
	/**
	 * 执行SQL语句
	 * @param {Object} options
	 * name: ( String ) 必选 数据库名称
	 * sql: ( Array[ String ] | String ) 必选 需要执行的SQL语句
	 */
	executeSQL(sql) {
		return new Promise((resolve, reject) => {
			plus.sqlite.executeSql({
				name: db.dbName,
				sql: sql,
				success: (res => {
					// console.log('执行SQL语句', res)
					resolve(true)
				}),
				fail: (e => {
					console.log('执行sql失败1: ' + JSON.stringify(e));
					reject(e)
				})
			});
		})
	},
	/**
	 * 删除表数据
	 * @param {Object} options
	 * name: ( String ) 必选 数据库名称
	 * sql: ( Array[ String ] | String ) 必选 需要执行的SQL语句
	 */
	immediatelyExecuteSQL(sql) {
		return new Promise((resolve, reject) => {
			plus.sqlite.executeSql({
				name: db.dbName,
				sql: sql,
				success: (res => {
					// console.log('删除数据表成功!');
					resolve(res)
				}),
				fail: (e => {
					console.log('执行sql失败1: ' + JSON.stringify(e));
					reject(e)
				})
			});
		})
	},
}
