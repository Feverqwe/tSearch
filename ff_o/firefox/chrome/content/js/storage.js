    /*
Built using Kango - Cross-browser extension framework.
http://kangoextensions.com/
*/
    /*
Built using Kango - Cross-browser extension framework.
http://kangoextensions.com/
*/
    var kango={};
    
    kango.oop={
        extend:function(base,props){
            var F=function(){};
            
            F.prototype=base.prototype;
            var result=new F();
            result.superclass=base;
            this.mixin(result,props);
            return result;
        },
        mixin:function(base,props){
            for(var k in props){
                if(props.hasOwnProperty(k)){
                    base[k]=props[k];
                }
            }
        },
        createProxy:function(baseObject){
            var F=function(){};
        
            F.prototype=baseObject;
            var result=new F();
            result.baseObject=baseObject;
            return result;
        },
        decorate:function(obj,memberName,decorator){
            var original=obj[memberName];
            obj[memberName]=function(){
                return decorator.call(this,original,arguments);
            };
    
        }
    };

    kango.array={
        filter:function(array,regexp){
            var len=array.length;
            var res=new Array();
            for(var i=0;i<len;i++){
                if(i in array){
                    var val=array[i];
                    if(regexp.test(val)){
                        res.push(val);
                    }
                }
            }
            return res;
        }
    };

    kango.string={
        format:function(str,params){
            for(var i=1;i<arguments.length;i++){
                str=str.replace(new RegExp('\\{'+(i-1)+'}','g'),arguments[i].toString());
            }
            return str;
        }
    };

    kango.date={
        diff:function(first,second){
            return Math.ceil((first.getTime()-second.getTime())/1000);
        }
    };

    kango.ExtensionInfo=function(){
        this.name='';
        this.description='';
        this.version='';
        this.background_scripts=[];
        this.content_scripts=[];
        this.browser_button={};

    };

    kango.NotImplementedException=function(methodName){
        methodName=methodName?methodName+' ':'';
        this.prototype=Error.prototype;
        this.name='KangoNotImplementedException';
        this.message='Method '+methodName+'is not implemented';
        this.toString=function(){
            return this.name+': '+this.message;
        };

    };

    kango.event={
        Ready:'Ready',
        Message:'message',
        Uninstall:'Uninstall'
    };

    kango.Event=function(type,obj,target){
        this.type=type;
        this.target=target||null;
        this.CAPTURING_PHASE=1;
        this.AT_TARGET=2;
        this.BUBBLING_PHASE=3;
        this.currentTarget=null;
        this.eventPhase=0;
        this.bubbles=false;
        this.cancelable=false;
        this.timeStamp=0;
        this.stopPropagation=function(){};
    
        this.preventDefault=function(){};
    
        if(typeof obj=='object'){
            kango.oop.mixin(this,obj);
        }
    };

    kango.EventTarget=function(){
        this._eventListeners={};

    };

    kango.EventTarget.prototype={
        _eventListeners:{},
        dispatchEvent:function(event){
            var eventType=event.type.toLowerCase();
            if(typeof this._eventListeners[eventType]!='undefined'){
                var listeners=this._eventListeners[eventType];
                for(var i=0;i<listeners.length;i++){
                    listeners[i](event);
                }
                return true;
            }
            return false;
        },
        fireEvent:function(type,obj){
            return this.dispatchEvent(new kango.Event(type,obj));
        },
        addEventListener:function(type,listener){
            if(typeof listener.call!='undefined'&&typeof listener.apply!='undefined'){
                var eventType=type.toLowerCase();
                var listeners=this._eventListeners[eventType]=this._eventListeners[eventType]||[];
                for(var i=0;i<listeners.length;i++){
                    if(listeners[i]==listener){
                        return false;
                    }
                }
                listeners.push(listener);
                return true;
            }
        },
        removeEventListener:function(type,listener){
            var eventType=type.toLowerCase();
            if(typeof this._eventListeners[eventType]!='undefined'){
                var listeners=this._eventListeners[eventType];
                for(var i=0;i<listeners.length;i++){
                    if(listeners[i]==listener){
                        listeners.splice(i,1);
                        return true;
                    }
                }
            }
            return false;
        }
    };

    kango.IConsole=function(){};
    
    kango.IConsole.prototype={
        log:function(str){
            throw new kango.NotImplementedException();
        }
    };

    kango.IIO=function(){};
    
    kango.IIO.prototype={
        isLocalUrl:function(url){
            return(url.indexOf(kango.SCHEME)==0||(url.indexOf('http://')==-1&&url.indexOf('https://')==-1));
        },
        getExtensionFileContents:function(filename){
            throw new kango.NotImplementedException();
        }
    };

    kango.IStorage=function(){};
    
    kango.IStorage.prototype={
        setItem:function(name,value){
            throw new kango.NotImplementedException();
        },
        getItem:function(name){
            throw new kango.NotImplementedException();
        },
        removeItem:function(name){
            throw new kango.NotImplementedException();
        },
        getKeys:function(){
            throw new kango.NotImplementedException();
        },
        clear:function(){
            throw new kango.NotImplementedException();
        }
    };

    kango.LangBase=function(){};
    
    kango.LangBase.prototype={
        getGlobalContext:function(){
            return((function(){
                return this;
            }).call(null));
        },
        invoke:function(context,methodName,params){
            var arr=methodName.split('.');
            var parent=context;
            var funcName=arr.pop();
            for(var i=0;i<arr.length;i++){
                parent=parent[arr[i]];
            }
            return parent[funcName].apply(parent,params);
        },
        evalInSandbox:function(win,api,text){
            throw new kango.NotImplementedException();
        },
        clone:function(obj){
            return JSON.parse(JSON.stringify(obj));
        },
        isString:function(obj){
            return(typeof obj=='string'||obj instanceof String);
        },
        isObject:function(obj){
            return(Object.prototype.toString.call(obj)=='[object Object]'||typeof obj=='object');
        },
        isArray:function(obj){
            return(obj instanceof Array||Object.prototype.toString.call(obj)=='[object Array]');
        },
        isFunction:function(obj){
            return(typeof obj=='function');
        }
    };
    (function(){
        kango.oop.mixin(kango,kango.EventTarget.prototype);
        kango.oop.mixin(kango,new kango.EventTarget());
        kango.oop.mixin(kango,{
            _configFileName:'extension_info.json',
            _extensionInfo:null,
            _messageRouter:null,
            _modules:[],
            _loadExtensionInfo:function(){
                this._extensionInfo=JSON.parse(kango.io.getExtensionFileContents(this._configFileName));
            },
            _initMessaging:function(){
                var self=this;
                this._messageRouter=new kango.MessageRouter();
                this._messageRouter.onmessage=function(event){
                    self.fireEvent(self.event.Message,event);
                };
            
                this.dispatchMessage=function(name,data){
                    this._messageRouter.dispatchMessage(name,data);
                };
        
            },
            _initModules:function(){
                for(var i=0;i<this._modules.length;i++){
                    (new this._modules[i]()).init(kango);
                }
            },
            _init:function(){
                this._loadExtensionInfo();
                this._initMessaging();
                this._initModules();
                return this.fireEvent(this.event.Ready);
            },
            registerModule:function(classObj){
                this._modules.push(classObj);
            },
            getExtensionInfo:function(){
                return kango.lang.clone(this._extensionInfo);
            },
            getContext:function(){
                var background=kango.backgroundScript.getContext();
                return background?background:kango.lang.getGlobalContext();
            },
            isDebug:function(){
                var info=this.getExtensionInfo();
                return(typeof info.debug!='undefined'&&info.debug);
            },
            SCHEME:'kango-extension://'
        });
    })();

    // Merged from /Users/anton/Documents/dev/kengo/src/js/ie firefox/kango/kango.part.js

    /*
Built using Kango - Cross-browser extension framework.
http://kangoextensions.com/
*/
    kango.TabProxy=function(tab){
        this.xhr=kango.xhr;
        this.console=kango.console;
        this.browser={
            getName:function(){
                return kango.browser.getName()
            }
        };
    
        this._tab=tab;
        this._listeners=[];
        (new kango.InvokeAsyncModule()).init(this);
        (new kango.MessageTargetModule()).init(this);
    };

    kango.TabProxy.prototype={
        _tab:null,
        _listeners:null,
        xhr:null,
        console:null,
        event:{
            Message:'message'
        },
        dispatchMessage:function(name,data){
            var event={
                name:name,
                data:data,
                origin:'tab',
                source:this._tab,
                target:this._tab
            };
            
            kango.fireEvent(kango.event.Message,event);
        },
        addEventListener:function(type,listener){
            if(type=='message'){
                for(var i=0;i<this._listeners.length;i++){
                    if(this._listeners[i]==listener){
                        return;
                    }
                }
                this._listeners.push(listener);
            }
        },
        fireEvent:function(type,event){
            event.source=event.target=this;
            if(type=='message'){
                for(var i=0;i<this._listeners.length;i++){
                    this._listeners[i](event);
                }
            }
        }
    };


    /*
Built using Kango - Cross-browser extension framework.
http://kangoextensions.com/
*/
    /*
Built using Kango - Cross-browser extension framework.
http://kangoextensions.com/
*/
    kango.PrefStorage=function(){
        this._preferenceBranch=Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch(this.PREFERENCE_BRANCH_NAME);
    };

    kango.PrefStorage.prototype={
        _preferenceBranch:null,
        PREFERENCE_BRANCH_NAME:'extensions.kango.storage.',
        setItem:function(name,value){
            return this._preferenceBranch.setCharPref(name,JSON.stringify(value));
        },
        getItem:function(name){
            var type=this._preferenceBranch.getPrefType(name);
            var val=null;
            if(type==this._preferenceBranch.PREF_STRING){
                val=this._preferenceBranch.getCharPref(name);
            }
            else if(type==this._preferenceBranch.PREF_INT){
                val=this._preferenceBranch.getIntPref(name);
            }
            else if(type==this._preferenceBranch.PREF_BOOL){
                val=this._preferenceBranch.getBoolPref(name);
            }
            if(typeof val!='undefined'&&val!=null){
                return JSON.parse(val);
            }
            else{
                return null;
            }
        },
        removeItem:function(name){
            try{
                return this._preferenceBranch.clearUserPref(name);
            }
            catch(e){
                return false;
            }
        },
        getKeys:function(){
            var count={};
    
            return this._preferenceBranch.getChildList('',count);
        },
        clear:function(){
            return this._preferenceBranch.deleteBranch('');
        }
    };

    kango.Storage=function(){
        var url='http://'+"kango".replace('_','-')+'.kangoextensions.com';
        var ios=Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService);
        var ssm=Components.classes['@mozilla.org/scriptsecuritymanager;1'].getService(Components.interfaces.nsIScriptSecurityManager);
        var dsm=Components.classes['@mozilla.org/dom/storagemanager;1'].getService(Components.interfaces.nsIDOMStorageManager);
        var uri=ios.newURI(url,'',null);
        var principal=ssm.getCodebasePrincipal(uri);
        this._storage=dsm.getLocalStorageForPrincipal(principal,'');
    };

    kango.Storage.prototype=kango.oop.extend(kango.IStorage,{
        _storage:null,
        getItem:function(name){
            var value=this._storage.getItem(name);
            if(typeof value!='undefined'){
                return JSON.parse(value);
            }
            else{
                return null;
            }
        },
        setItem:function(name,value){
            return this._storage.setItem(name,JSON.stringify(value));
        },
        removeItem:function(name){
            return this._storage.removeItem(name);
        },
        clear:function(){
            return this._storage.clear();
        },
        getKeys:function(){
            var keys=[];
            for(var i=0;i<this._storage.length;i++){
                keys.push(this._storage.key(i));
            }
            return keys;
        }
    });
    kango.storage=new kango.Storage();
    kango.addEventListener(kango.event.Uninstall,function(){
        window.addEventListener('beforeunload',function(){
            kango.storage.clear();
        },false);
    });
    (function(){
        var prefStorage=new kango.PrefStorage();
        var keys=prefStorage.getKeys();
        if(keys.length>0){
            for(var i=0;i<keys.length;i++){
                kango.storage.setItem(keys[i],prefStorage.getItem(keys[i]));
            }
            prefStorage.clear();
        }
    })();



    var SetSettings = function (key,value) {
        kango.storage.setItem(key, value);
        return value;
    }
    var GetSettings = function (key) {
        if (kango.storage.getItem(key) === null)
            return undefined;
        else
            return kango.storage.getItem(key);
    }