export default {
	install(Vue, options){
		Vue.verifyError = true;
		Vue.verifyItem = {};

		Vue.detectTypes = function(obj){
			return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
		};

		Vue.myValidate = function(name){
			_verify(name);			
			
			for(let key in Vue.verifyItem){
				if(Vue.verifyItem[key]['valid'] === false){
					Vue.verifyError = true;
					return;
				}else{
					Vue.verifyError = false;
				}
			}

		};
		
		function _verify(name){
			let obj, value, arg;

			if(Vue.verifyItem[name]){
				obj = Vue.verifyItem[name];
				value = obj.value;
			}else{
				return;
			}

			$.each(obj.types,function(idx, item){
				if( ~item.indexOf('(') ){
					arg = item.slice(item.indexOf('(')+1, item.indexOf(')'));
					item = item.split('(')[0];
				}
				if( _verifyRules[item](value, arg) ){
					obj.valid = true;
					obj['Tpl'].innerHTML = '';
					obj['Tpl'].className = '';
				}else{
					obj['Tpl'].innerHTML = _errorMsg(item, name, arg);
					obj['Tpl'].className = 'verify-error error-pos';
					obj.valid = false;
					return false;
				}
			});
		};

		const _verifyRules = {
			required(val) {
			  if (typeof val === 'number' || typeof val === 'function') {
				return true;
			  } else if (typeof val === 'boolean') {
			    return val;
			  } else if (typeof val === 'string') {
			    return val.length > 0;
			  } else if ( Vue.detectTypes(val) === 'object' ) {
			    return Object.values(val)[0].length > 0;
			  } else if (val === null || val === undefined) {
			    return false;
			  }
			},
			email(value) {
				if(value === '') return true;
				return (/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).test(value);
			},
			maxlength(val,arg) {
				return val.length <= parseInt(arg, 10);
			},
			minlength(val,arg) {
				return val.length >= parseInt(arg, 10);
			},
			passwordsync(obj){
				var valArr = [];
				if( Vue.detectTypes(obj) === 'object' ){
					valArr = Object.values(obj);
					return valArr[0]===valArr[1];
				}else {
					return false;
				}
			},
			numeric: function (value) {
				return (/^-?(?:0$0(?=\d*\.)|[1-9]|0)\d*(\.\d+)?$/).test(value);
			},
			integer: function (value) {
				return (/^(-?[1-9]\d*|0)$/).test(value);
			},
			digits: function (value) {
				return (/^[\d() \.\:\-\+#]+$/).test(value);
			},
			alpha: function (value) {
				return (/^[a-zA-Z]+$/).test(value);
			},
			alphaNum: function (value) {
				return !(/\W/).test(value);
			},
			url: function (value) {
				return (/^(https?|ftp|rmtp|mms):\/\/(([A-Z0-9][A-Z0-9_-]*)(\.[A-Z0-9][A-Z0-9_-]*)+)(:(\d+))?\/?/i).test(value);
			},
			
			length: function (value) {
				return value && value.length == +arg;
			},
			min: function (value,arg) {
				return value >= +arg;
			},
			max: function (value,arg) {
				return value <= +arg;
			},
			pattern: function (value,arg) {
				var match = arg.match(new RegExp('^/(.*?)/([gimy]*)$'));
				var regex = new RegExp(match[1], match[2]);
				return regex.test(value);
			}
		};		

		function _errorMsg(type, name, len){
			name = name.replace(/([A-Z]+)/g, $1=>' '+$1.toLowerCase());	
			name = name.substr(0, 1).toUpperCase() + name.substr(1);

			const mapErrorMsg = {
				'required':  name + ' is required.',
				'maxlength': name + ' length can not more than ' + len + ' characters',
				'minlength': name + ' length at least ' + len + ' characters',
				'email': 'Please enter a valid email address',
				'passwordsync': 'The two passwords you entered do not match'
			};

			return mapErrorMsg[type];
		}

		Vue.directive('verify', {
			bind(el, binding, vnode, oldVnode){
				let name = binding.expression,
					val = binding.value,
					obj = {},
					errorTpl;

				obj[name]= {};
				obj[name]['valid'] = false;
				obj[name]['value'] = val;
				obj[name]['types'] = binding['arg'].split(',');
				errorTpl = document.createElement('p');
				errorTpl.innerHTML = '';
				obj[name]['Tpl'] = errorTpl;
				
				Object.assign(Vue.verifyItem, obj);	
			},
			inserted(el, binding, vnode, oldVnode){
				let name = binding.expression;
				el.parentNode.appendChild(Vue.verifyItem[name]['Tpl']);
			},
			update(el, binding, vnode){
				let types = binding.arg.split(','),
					name = binding.expression,
					val = binding.value,
					oldVal = binding.oldValue;

				// if( Vue.detectTypes(val)==='object' && Object.values(val)[0]===Object.values(oldVal)[0] ) return;
				if(val === oldVal) return;

				Vue.verifyItem[name]['value'] = val;	
				_verify(name);
			},
			componentUpdated(el,binding){
				console.log(Vue.verifyError);
			},
			unbind(el, binding, vnode, oldVnode){
				Vue.verifyItem = {};
				Vue.verifyError = true;
			}
		});
	}
};