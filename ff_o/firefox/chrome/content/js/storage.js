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
    }
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

(function(){
    kango.oop.mixin(kango);
})();

kango.PrefStorage=function(){
    this._preferenceBranch=Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch(this.PREFERENCE_BRANCH_NAME);
};

kango.PrefStorage.prototype={
    _preferenceBranch:null,
    PREFERENCE_BRANCH_NAME:'extensions.TorrentsMultiSearch.storage.',
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
    var url="http://TorrentsMultiSearch";
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
    var val = kango.storage.getItem(key);
    if (val === null)
        return undefined;
    else
        return val;
}