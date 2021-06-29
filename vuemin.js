// 自制vue 代码
//模板编译类
class Compile{
   constructor(vm,el){
      this.vm = vm
      //判断el属性是不是元素，如果不是元素就获取他
      this.el = this.isElementNode(el)?el:document.querySelector(el)
     // 把当前节点中的元素 ， 获取到放在内存值哦昂
      let fragment = this.node2fragment(this.el)
      //把节点中的内容替换
      this.compile(fragment)     //把文档碎片渲染到页面上
      this.el.appendChild (fragment)
   }
   compile(node){  
       //用来编译节点
       let childNodes = node.childNodes
       let newchildNodes = [...childNodes].forEach(child => {
          //判断是文本节点 还是元素节点
            if (this.isElementNode(child)) {
               this.compileElement(child)
               //遍历儿子
               this.compile(child)
            }else{
               this.compiletext(child)
            }
       });
        
   }
    //判断是否带有指令
     isDirective(name){
         return name.startsWith('v-')
     }
   //编译元素的方法
   compileElement(node){
     //查看当前元素中是否有v-字符
      let attributes = [...node.attributes].forEach(attr=>{
           let {name,value:expr} = attr
      
           //判断他是否是一带有指令的输入框
           if (this.isDirective(name)) {
               let [,a]  = name.split('-')
               //需要调用不同属性
               Compiletoll[a](node,expr,this.vm)
           }
          
      })
    
     
   }
   
   //编译文本的方法
   compiletext(node){
       let content = node.textContent
       
       //使用正则判断是否有大括号
       if (/\[\[(.+?)\]\]/.test(content)) {
        Compiletoll['text'](node,content,this.vm)
       }
   }
   node2fragment(node){
       //创建一个文档碎片
        let fragment = document.createDocumentFragment();
        let firstChild
        while (firstChild = node.firstChild) {
            // 把节点移动到文档碎片中
            fragment.appendChild(firstChild)
        }
        return fragment
   }
   isElementNode(node){
       return  node.nodeType === 1
   } // 是不是元素节点
}
// 编译工具o
Compiletoll={
    //取值方法
    getVal(vm,expr){
       return expr.split('.').reduce((data,current)=>{
           return data[current]
       },vm.$data)
    },
    //expr 属性值 name属性名 vm 实例
     m(node,expr,vm){
         let fn = this.updata['mupdata']
         new Watcher(vm,expr,(newvalue)=>{
              fn(node,newvalue)
         })
         let value = this.getVal(vm,expr)
         fn(node,value)
     },
     getcontext(vm,text){
           let content = text.replace(/\[\[(.+?)\]\]/g,(...args)=>{
               return this.getVal(vm,args[1])
            })
           return content

     },
     text(node,text,vm){
        let fn = this.updata['textupdata']
        // 获取的字符串可能是 {{a}} {{b}} 所以我们需要处理下
        let content = text.replace(/\[\[(.+?)\]\]/g,(...args)=>{
        //这里的args[1]  a b  当是a变动的时候应该返回 ab 的全值
          new Watcher(vm,args[1],()=>{
            fn(node,this.getcontext(vm,text)) 
         })
           return  this.getVal(vm,args[1])
        })
    
        fn(node,content)
        
     },
     updata:{
         textupdata(node,value){
             node.textContent = value
         },
         mupdata(node,value){
             console.log(node);
              node.value = value
         }
     }
}
//数据劫持
class Observe{
    constructor(data){
        this.observe(data)
    }
    observe(data){
        if (data && typeof data =='object') {
            let newdata = Object.keys(data)
            newdata.forEach((element) => {
                this.definrReactive(data,element,data[element])  
            });
        }
    }
    definrReactive(obj,key,value){
        this.observe(value)
         //给每个数数据生成一个可以订阅 发布 的订阅器
       const dep = new Dep()

        //   console.log(value , key ,data);
       Object.defineProperty(obj,key,{
           get(){
               //查看是否有订阅者 有的话把订阅者 添加到订阅消息其厘米昂
               Dep.targe&& dep.subscription(Dep.targe)
               return value
           },
           set:(newvalue)=>{
               //判断新值和老值是否相当
               if (newvalue !== value) {
                   //如果改变赋值的是一个对象
                   //如果数据改变 用定乐器 发布通知订阅者发生改变

                   this.observe(newvalue)
                   value = newvalue
                   dep.release()
               }
            
           }
       })

    }
}
//  发布订阅
  //订阅消息器
  class Dep{
       constructor(){
           this.sub =[]
       }
       //订阅
       subscription(a){
        this.sub.push(a)
       }
       //发布
       release(){
          this.sub.forEach(watcher=>{
              watcher.updataa()
          })
       }

  }
  //订阅者
  class Watcher{
      constructor(vm,expr,cd){
         this.vm = vm
         this.expr = expr
         this.cd = cd
         //先存一个老值
         this.oldvalue = this.get(this.vm,this.expr)
      }
      get(){
          Dep.targe  = this
          let value = Compiletoll.getVal(this.vm,this.expr)
          Dep.targe = null
          return value
      }
      updataa(){
          //数据发生改变获取新值
        let newvalue =  Compiletoll.getVal(this.vm,this.expr)
        //如果数据改变调用回调函数
        if (newvalue !== this.oldvalue)  {
            this.cd(newvalue)
        }

      }
  }
//
//基础类
class Vue{
   constructor(options){
        this.$el = options.el
        this.$data = options.data
        //首先判断根元素是否存在
        if (this.$el) {
        //进行数据劫持
           new Observe(this.$data)
         //如果存在就调用编译模板
       new Compile(this,this.$el); 
     console.log(new Compile(this,this.$el));   
        }
    
   }
}