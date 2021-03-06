var vm_init=function(){
	var start=function(){
		//--------------------------------------------------------
		$vm.start_time=new Date().getTime();
		//check and clear localstorage
		var data=''; for(var key in window.localStorage){ if(window.localStorage.hasOwnProperty(key)){ data+=window.localStorage[key]; }}
		if(data.length>3000000) localStorage.clear();
		if(window.location.href.indexOf('?clearcache=1')!=-1){
			localStorage.clear();
			alert("Cache is cleard!");
			return;
		}
		//set name space
		$VmAPI={};$vm.module_list={};$vm.config_list={}
		//--------------------------------------------------------
		//get hosting path
		var href = window.location.href.split('?')[0];
		var path=href.split('/index.html')[0];
		var lastChar=path[path.length-1];
		if(lastChar=='/') path=path.substring(0,path.length-1);
		$vm.hosting_path=path;
		if(window.location.hostname=='127.0.0.1' || window.location.hostname=='localhost')	$vm.debug =true;
		//--------------------------------------------------------
		$vm.reload='';
		if(window.location.toString().indexOf('_d=3')!=-1){
			$vm.reload=new Date().getTime().toString();
		}
		$vm.version=$vm.ver[0];
		//--------------------------------------------------------
		var url=$vm.hosting_path+"/index.json";
		var ver=localStorage.getItem(url+"_ver");
		var txt=localStorage.getItem(url+"_txt");
		//------------------------------------------
		if(ver!=$vm.ver[1] || txt===null || $vm.debug===true || $vm.reload!=''){
			console.log((new Date().getTime()-$vm.start_time).toString()+"---"+'loading '+url+'?_='+$vm.ver[1]+$vm.reload);
			$.get(url+'?_='+$vm.ver[1]+$vm.reload,function(data){
				localStorage.setItem(url+"_txt",data);
				localStorage.setItem(url+"_ver",$vm.ver[1]);
				app_init(data);;
			},'text').fail(function() {
				alert( "The configuration file ("+url+") doesn't exist!" );
			});
		}
		else{ app_init(txt); }
		//------------------------------------------
	}
	//--------------------------------------------------------
	var app_init=function(txt){
		var text=$('<div/>').html(txt).text();
		//---------------------------
		var config;
		try{ config=JSON.parse(text);}
		catch (e){ alert("Error in app config file\n"+e); return; }
		//--------------------------------------------------------
		$vm.app_config=config;
		//--------------------------------------------------------
		$vm.parts_path="https://vmiis.github.io/component";
		$vm.image_path=config.image_path;
		if(window.location.hostname=='127.0.0.1' || window.location.hostname=='localhost'){
			$vm.library_path =window.location.protocol+'//'+window.location.host;
		}
		//--------------------------------------------------------
		if(config.default_production=='No'){
			if(window.location.toString().indexOf('database=production')!=-1){
				$vm.server          ='production';
				$VmAPI.api_base     =config.api_path_production;
			}
			else if(window.location.toString().indexOf('database=woolcock')!=-1){
				$vm.server          ='production';
				$VmAPI.api_base     =config.api_path_woolcock;
			}
			else{
				$vm.server          ='development';
				$VmAPI.api_base     =config.api_path_development;
			}
		}
		else {
			if(window.location.toString().indexOf('database=development')!=-1){
				$vm.server          ='development';
				$VmAPI.api_base     =config.api_path_development;
			}
			else{
				$vm.server          ='production';
				$VmAPI.api_base     =config.api_path_production;
			}
		}
		$vm.debug_message=true; //show debug message in console
		//--------------------------------------------------------
		load_vmapi();
	}
	//--------------------------------------------------------
	//load vm framework, vm api and first module
	var load_vmapi   =function(){ load_js($vm.url('https://api.vmiis.com/distribution/vmapi.min.js'),load_vm);	}
    var load_vm      =function(){ load_js($vm.url('https://framework.vmiis.com/distribution/vmframework.min.js'),init);}
	var init         =function(){
		$vm.init_v3({callback:function(){$vm.init_status=1;}})
		$vm.load_first_module_to_body({url:'/layout/main.html'});
	}
	//--------------------------------------------------------
	var load_js=function(url,next){
		//this is js loader
		var ver=localStorage.getItem(url+"_ver");
		var txt=localStorage.getItem(url+"_txt");
		//------------------------------------------
		if(ver!=$vm.ver[2] || txt===null || $vm.debug===true || $vm.reload!=''){
			console.log((new Date().getTime()-$vm.start_time).toString()+"---"+'loading '+url+'?_='+$vm.ver[2]+$vm.reload);
			$.get(url+'?_='+$vm.ver[2]+$vm.reload,function(data){
				localStorage.setItem(url+"_txt",data);
				localStorage.setItem(url+"_ver",$vm.ver[2]);
				$('head').append('<scr'+'ipt>'+data+'</scr'+'ipt>');
				next();
			},'text');
		}
		else{ $('head').append('<scr'+'ipt>'+txt+'</scr'+'ipt>'); next(); }
		//------------------------------------------
	}
	//--------------------------------------------------------
	$vm.url=function(text){
        //replace some text in old modules to the correct ones
		text=text.replace(/__HOST__\//g,$vm.hosting_path+'/');
		text=text.replace(/__VER__/g,$vm.ver[0]);
		text=text.replace(/__BASE__\/vmiis\/Common-Code\//g,'__COMPONENT__/');
		text=text.replace(/__LIB__\/vmiis\/Common-Code\//g,'__COMPONENT__/');
		text=text.replace(/__BASE__\/vmiis\/common-code\//g,'__COMPONENT__/');
		text=text.replace(/__LIB__\/vmiis\/common-code\//g,'__COMPONENT__/');
        text=text.replace(/__PARTS__\//g,'__COMPONENT__/');
		text=text.replace(/__COMPONENT__\//g,'https://component.vmiis.com/');

		if(window.location.toString().indexOf('_d=1')!=-1){
			//use local system files
            var host=window.location.protocol+'//'+window.location.host;
			text=text.replace(/https:\/\/api.vmiis.com/g,host+'/vmiis/api-2');
			text=text.replace(/https:\/\/framework.vmiis.com/g,host+'/vmiis/framework-2');
			text=text.replace(/https:\/\/component.vmiis.com/g,host+'/vmiis/component-2');
		}
		return text;
	}
	//--------------------------------------------------------
	var resources=[
		"https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css",
		"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css",
		"https://ajax.aspnetcdn.com/ajax/jquery.ui/1.12.1/themes/redmond/jquery-ui.css",

		"https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js",
		"https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js",
		"https://ajax.aspnetcdn.com/ajax/jquery.ui/1.12.1/jquery-ui.min.js",
		"https://apis.google.com/js/plusone.js",
		"https://ajax.aspnetcdn.com/ajax/jquery.validate/1.14.0/jquery.validate.min.js",
		"https://sdk.amazonaws.com/js/aws-sdk-2.1.34.min.js",
		"https://www.gstatic.com/charts/loader.js"
	];
	//------------------------------------
	var load_resources=function(links){
		for(i in links){
			var e=links[i].split('.').pop();
			if(e=='css'){
				$('head').append("<link rel='stylesheet' href='"+links[i]+"'>");
			}
			else if(e=='js'){
				load_js_link(links[i])
			}
		}
	}
	//------------------------------------
	var load_js_link=function(link){
		$.getScript(link,function(){
			var nm=link.split('/').pop();
			nm=nm.replace(/\./g,'-');
			$vm[nm]=1;
			if(nm=='loader-js'){
				google.charts.load('current', {packages: ['corechart']});
			}
		});
	}
	//------------------------------------
	setTimeout(function (){	$.ajaxSetup({cache:true}); load_resources(resources); },10);
	//------------------------------------

	//********************************************************
	start();
	//********************************************************
}
