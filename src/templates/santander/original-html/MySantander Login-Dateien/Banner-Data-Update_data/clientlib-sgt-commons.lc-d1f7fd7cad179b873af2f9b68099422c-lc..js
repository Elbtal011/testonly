/**
 * @file : cmp_modals.js
 *
 * @project : SGT-AEM-CATALOG
 *
 * @date : 230201
 *
 * @desc : JS para modales
 */
// jshint esversion:8, jquery: true


/**
 * Operativa de modales genérica, comunicación via eventos
 *
 * @method SGT_CMP_MODALS
 *
 * @param {obj} options: opciones para la modal
 *
 * @desc el evento modal_close_important sobre el body con dato del boton lanzador, cierra la modal
 */
const SGT_CMP_MODALS=(options)=>{

  // Opciones por defecto
  const defaults={
    debug               : false, // muestra console, etc
    ctrl_focus          : true, // Gestiona el focus en la modal
    $btn_lanzador_modal : null, // boton lanzador de la modal para devolver el foco
    modal_id            : null, // id única para la modal
    modal_data          : {},  // carga de datos para su uso en la modal si fuese necesario
    modal_class         : "", // clase discriminadora
    modal_size          : "modal-md", // tamaño de la modal (md mediana por defecto, sm pequeña, xl grande, modal-total ocupa toda la vista)
    modal_type          : "modal_default", // tipo de modal
    modal_title         : "", // html para el title
    modal_content       : "", // html para contenido
    modal_footer        : "", // html para el footer
    btn_close_text      : "Close Modal", // Texto boton cerrar
    events : {
      on_open  : null,   // Fn a ejecutar en la accion open
      on_close : null,  // Fn a ejecutar en la accion close
    },
    $modal_insert : null, // si es necesario puede adjudicarse una capa como contenedor de la modal
    // Para las animaciones open y close, con parametrizacion de jquery animate
    effects:{
      open:{
        velocity:"slow",
        animation:{"opacity":"1"},
      },
      close:{
        velocity:"slow",
        animation:{"opacity":"0"},
      },
    },
  };

  // Opciones finales
  let data_modal={...defaults};
  // Si hay options se mergean con defaults
  const isObject=(a) => (typeof(a)!=="undefined" && typeof(a)==="object" && a!==null);
  if(isObject(options)){
    const merge_options=(a,b)=>{
      Object.entries(b).forEach(([k, v]) => a[k] = isObject(v) ? merge_options(a[k] || {}, v) : v);
      return a;
    }
    data_modal=merge_options(defaults,options);
    // fallback porque a veces los dom elements no se mergean
    data_modal.$btn_lanzador_modal=options.$btn_lanzador_modal||defaults.$btn_lanzador_modal;
  }

  if(data_modal.debug){
    console.log("[modals.js] SGT_CMP_MODALS() data_modal",data_modal);
  }

  const $body=$(document.body);

  /**
   * Inicio de flujo
   *
   * @method INIT
   */
  const INIT=async ()=>{

    // control de modal con id unica
    if(data_modal.modal_id!==null){
      const $modal_existente=$body.find("#"+data_modal.modal_id);
      if($modal_existente.length===1){
        $body.trigger("modal_close_important",{
          event_$btn_clicked : data_modal.$btn_lanzador_modal,
          event_$modal       : $modal_existente,
        });
        // delay para evitar reflow
        await OPS.sleep(800);
      }
    }
    TMPL.create(data_modal);
    // A la apertura se insertan los componentes en la modal
    OPS.modal.open(data_modal,TMPL.insert_components);

  },

  /**
   * Eventos generales en la modal
   *
   * @method EVENTOS
   *
   * @param {object} data_modal: datos de la modal
   * 
   * @desc: Hay que hacer off en los eventos para que no se dupliquen al llamarse a esta fn cada vez que se cra una modal en el DOM 
   */
  EVENTOS=(data_modal)=>{

    // callback interno en el cierre de modal
    const cb_close=function(data_modal){
      if(data_modal.$btn_lanzador_modal!==null){
        setTimeout(function(){
//console.log("CMP_MODAL->EVENTOS->cb_close()",data_modal.$btn_lanzador_modal)
          // Se devuelve el foco al boton lanzador
          data_modal.$btn_lanzador_modal.focus();
        },300);
      }
      // Elimina la modal del dom al cierre
//console.log("cb_close -> data_modal.$modal",data_modal.$modal)
      data_modal.$modal.closest(".cont_modal").remove();
    };

    // Al click en los botones (y la capa backdrop) para cerrar la modal
    const $btns_cerrar=data_modal.$modal.find('[data-action="modal_dismiss"]');
    const $modal_back=data_modal.$modal_container.find(".modal_back");
    $btns_cerrar.push($modal_back[0]);
    $btns_cerrar.off("click").on("click",function(){
      OPS.modal.close(data_modal,cb_close.bind(data_modal));
      return false;
    });

    // Al haber desencadenado un evento de cierre sobre la modal y desde cualquier lugar
    // El boton que lanza debe de propagarse con el evento
    $body.off("modal_close_important").on("modal_close_important",function(e,data_event){
//console.log("EVENTOS -> modal_close_important")
      if(typeof(data_event)!=="undefined"){
        if(typeof(data_event.event_$btn_clicked)!=="undefined"){
          data_modal.$btn_lanzador_modal=data_event.event_$btn_clicked;
        }
        if(typeof(data_event.event_$modal)!=="undefined"){
          data_modal.$modal=data_event.event_$modal;
        }
        OPS.modal.close(data_modal,cb_close.bind(data_modal));
      }
    });

  },

  TMPL={

    /**
     * Inserta contenidos proporcionados por las opciones en los campos adecuados
     *
     * @method TMPL.insert_components
     *
     * @param {obj} data Datos de la modal
     */
    insert_components:(data)=>{
      data.$modal.find(".modal_cont_title").html(data.modal_title);
      data.$modal.find(".modal_body").html(data.modal_content);
      data.$modal.find(".modal_footer").html(data.modal_footer);
    },

    /**
     * Crea el html necesario de la capa de modal y la inserta en el contenedor adecuado
     *
     * @method TMPL.create
     *
     * @param {object} data: datos de la modal
     */
    create:(data)=>{

      const modal_html=`<div class="cont_modal ${data.modal_class} d-none" tabindex="-1" aria-modal="true" role="dialog" aria-labelledby="modal_title">
        <div class="modal_back"></div>
        <div class="modal d-none ${data.modal_size}" style="opacity:0" data-modal_type="${data.modal_type}">
          <div class="modal_header">
            <div id="modal_title" class="modal_cont_title"></div>
            <button class="btn btn_cerrar" data-action="modal_dismiss" aria-label="${data.btn_close_text}" title="${data.btn_close_text}">
               <span class="icono icon_close" aria-hidden="true"></span>
            </button>
          </div>
          <!-- /.modal_header -->

          <div class="modal_content">
            <div class="modal_body"></div>
          </div>
          <!-- /.modal_content -->

          <div class="modal_footer">
          </div>
          <!-- /.modal_footer -->

        </div>
      </div>`;

      let $container_modal=null;
      // Planteamiento por si es necesario incluir la modal en alguna capa especifica
      if(data.$modal_insert===null){
        $container_modal=$body;
      }
      else{
        $container_modal=data.$modal_insert;
      }
      // La modal se inserta en el body
      $container_modal.append(modal_html);
      const $modal=$container_modal.find(".modal");
      if(data.modal_id!==null){
        $modal.closest(".cont_modal").attr("id",data.modal_id);
      }
      data_modal.$modal=$modal;
      data_modal.$modal_container=$container_modal;

      
    },
  },

  // Contenedor de operaciones
  OPS={

    /**
     * Crea un delay
     * 
     * @method OPS.sleep
     * 
     * @param {num} ms : Ms de retardo
     * 
     * @return {Promise}
     */
    sleep:function(ms){
      return new Promise(resolve => setTimeout(resolve, ms));
    },

    // Contenedor de operaciones para las modales
    modal:{

      /**
       * Acciones de apertura sobre la modal dada
       *
       * @method OPS.modal.open
       *
       * @param {object} data_modal: datos de la modal
       * @param {fn} cb: Callback a a ejecutar una vez finalizada la apertura visual
       */
      open:(data_modal,cb)=>{
        // calculo de tamaño de barra vertical scroll y aplicacion por css
        document.body.style.setProperty(
          "--scrollbar-width",
          `${window.innerWidth - document.body.clientWidth}px`
        );
        // fixed con eliminacion de barra de desplazamiento
        $body.addClass("modal_opened modal_open_"+data_modal.modal_type);
        // vista de backdrop
        data_modal.$modal.closest(".cont_modal").removeClass("d-none");
        // pintado de modal
        data_modal.$modal.removeClass("d-none");
        // pintado de items en la modal, deberia de coger tamaños
        if(cb){
          cb(data_modal);
        }

        // animacion opacity
        data_modal.$modal.stop(true).animate(data_modal.effects.open.animation,data_modal.effects.open.velocity,function(){
          //$(this).find(".btn_cerrar").focus();

        }).promise().then(function(){
          EVENTOS(data_modal);
          // Lanza evento sobre el body con los datos de la modal por si fuese necesario
//console.log("CMP_MODAL->OPS.modal.open() Lanza evento cmp_modal_opened")
          $body.trigger("cmp_modal_opened",data_modal);
          // callback propietario de la fn lanzadora
          if(data_modal.events.on_open && data_modal.events.on_open!==null){
            data_modal.events.on_open(data_modal);
          }
          if(data_modal.ctrl_focus){
            OPS.modal.focus_control(data_modal);
          }
        });

      },

      /**
       * Acciones de cierre sobre la modal dada
       *
       * @method OPS.modal.close
       *
       * @param {object} data_modal: datos de la modal
       * @param {fn} cb: Callback a ejecutar una vez finalizada el cierre visual
       */
      close:(data_modal,cb)=>{
        data_modal.$modal.stop(true).animate(data_modal.effects.close.animation,data_modal.effects.close.velocity,function(){
          $(this).addClass("d-none");
        }).promise().then(function(){
          $body.removeClass("modal_opened modal_open_"+data_modal.modal_type);

          // Lanza evento sobre el body con los datos de la modal por si fuese necesario
//console.log("CMP_MODAL->OPS.modal.close() Lanza evento cmp_modal_closed")
          $body.trigger("cmp_modal_closed",data_modal);

          if(cb){
            cb(data_modal);
          }

          // callback propietario de la fn lanzadora
          if(data_modal.events.on_close && data_modal.events.on_close!==null){
            data_modal.events.on_close(data_modal);
          }
        });
      },

      /**
       * Control de foco en la modal a trabes de teclado
       *
       * @method OPS.modal.focus_control
       *
       * @param {object} data_modal: datos de la modal
       */
      focus_control:(data_modal)=>{
        const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const modal = document.querySelector("."+data_modal.modal_class);

        const firstFocusableElement = modal.querySelectorAll(focusableElements)[0];
        const focusableContent = modal.querySelectorAll(focusableElements);
        const lastFocusableElement = focusableContent[focusableContent.length - 1];

        document.addEventListener('keydown', function(e) {
          let isTabPressed = e.key === 'Tab';

          if (!isTabPressed) {
            return;
          }

          if (e.shiftKey) { 
            if (document.activeElement === firstFocusableElement) {
              lastFocusableElement.focus(); 
              e.preventDefault();
            }
          }
          else {
            if (document.activeElement === lastFocusableElement) {
              firstFocusableElement.focus();
              e.preventDefault();
            }
          }
        });

        firstFocusableElement.focus();
      },

    },
  };

  // Inicialización
  INIT();
};


/**
 * Acciones para los botones de modal en el cont_menu_heading
 * Por ejemplo pagina de error en la traduccion de un idioma al pulsar un idioma inexistente
 *
 * @method HEADER_MODALS
 */
const HEADER_MODALS=()=>{
  const $body=$(document.body);
  const $cont_menu_heading=$body.find(".cont_menu_heading");
  const $btns_modal=$cont_menu_heading.find(".btn_modal");

  const INIT=()=>{
    EVENTOS();
  },
  EVENTOS=()=>{

    // Al click en un boton para modal
    $btns_modal.on("click",function(){
      const $btn=$(this);
      OPS.gestiona_modal($btn);
    });

  },
  OPS={
    /**
     * Gestiona el pintado de una modal a través del data-action_modal de un botón dado
     *
     * @method OPS.gestiona_modal
     *
     * @param {dom object} $btn: Botón jquery afectado
     */
    gestiona_modal:($btn)=>{

      const action=$btn.attr("data-modal_action");
      switch (action){
        // Error de idioma
        case "error_language":{
          const btn_datos=$btn.data();
          // Opciones por defecto para la modal
          const options_modal_error={
            debug               : false,
            ctrl_focus          : true, // Gestiona el focus en la modal
            $btn_lanzador_modal : null, // boton lanzador de la modal, si no hay se abre la modal directamente
            modal_data          : {}, // carga de datos para su uso en la modal si fuese necesario
            modal_class         : "modal_header_error_language", // clase discriminadora
            modal_size          : "modal-md", // tamaño de la modal (md mediana por defecto, sm pequeña, xl grande, modal-total ocupa toda la vista)
            modal_type          : "modal_default", // tipo de modal
            modal_title         : TMPL.modal_lang_error.pinta_header($btn), // html para el title
            modal_content       : TMPL.modal_lang_error.pinta_body($btn), // html para contenido
            modal_footer        : TMPL.modal_lang_error.pinta_footer($btn), // html para el footer
            btn_close_text      : btn_datos.linktextclosewindowmodal, // Texto boton cerrar
            events        : {
              // Fn a ejecutar en la accion open
              on_open  :null,
              // Fn a ejecutar en la accion close
              on_close : ()=>{
                // si el dropdown no se encuentra desplegado se aplica foco en boton de despliegue dropdown
                // Si se encuentra desplegado, se aplica foco en el boton lanzador
                const $dropdown_container=$btn.closest(".dropdown_container");
                const $btn_dropdown=$dropdown_container.find(".dropdown_btn");
                const isExpanded=($btn_dropdown.attr("aria-expanded")==="true");
                if(!isExpanded){
                  $btn_dropdown.focus();
                }
                else{
                  $btn.focus();
                }
              }, 
            }
          };
          SGT_CMP_MODALS(options_modal_error);
        }
        break;
        default:
      }

    }
  },
  TMPL={

    modal_lang_error:{
         
      /**
       * Callback para el pintado de un mensaje de error para idioma no definido en la modal de lang error
       *
       * @method TMPL.modal_lang_error.pinta_enlace
       *
       * @param {dom object} $btn: boton lanzador
       * 
       * @return {str} internal_html: Html para insertar
       */
      pinta_enlace:($btn)=>{
        const btn_datos=$btn.data();
        // compone el html para pintar en la modal
        const internal_html=`<div class="lang_error_enlace">
          <a class="link" href="${btn_datos.linkurlmodal}" target="${btn_datos.linktarget}" title="${btn_datos.linktooltipmodal}">${btn_datos.textpagemodal}</a>
        </div>`;
        return internal_html;
      },

      /**
       * Callback para el pintado del header de la modal
       *
       * @method TMPL.modal_lang_error.pinta_header
       *
       * @param {dom object} $btn: boton lanzador
       * 
       * @return {dom object} modal_lang_error_header: Html para insertar
       */
      pinta_header:($btn)=>{
        const $capa_header=$btn.closest("li").find(".modal_errornotranslate--header");
        let modal_lang_error_header="";
        if($capa_header.length>0){
          modal_lang_error_header=$capa_header.html();
        }
        else{
          modal_lang_error_header=$btn.data('titlemodal');
        }
        return modal_lang_error_header;
      },

      /**
       * Callback para el pintado del body de la modal
       *
       * @method TMPL.modal_lang_error.pinta_body
       *
       * @param {dom object} $btn: boton lanzador
       * 
       * @return {dom object} modal_lang_error_body: Html para insertar
       */
      pinta_body:($btn)=>{
        const $capa_body=$btn.closest("li").find(".modal_errornotranslate--body");
        let modal_lang_error_body="";
        if($capa_body.length>0){
          modal_lang_error_body=$capa_body.html();
        }
        return modal_lang_error_body;
      },

      /**
       * Callback para el pintado del footer de la modal
       *
       * @method TMPL.modal_lang_error.pinta_footer
       *
       * @param {dom object} $btn: boton lanzador
       * 
       * @return {dom object} modal_lang_error_footer: Html para insertar
       */
      pinta_footer:($btn)=>{
        const $capa_footer=$btn.closest("li").find(".modal_errornotranslate--footer");
        let modal_lang_error_footer="";
        if($capa_footer.length>0){
          modal_lang_error_footer=$capa_footer.html();
        }
        return modal_lang_error_footer;
      },
    },

  };

  INIT();
};


/**
 * Desde SGT ([video.js] -> videoPlay()) se recibe en el body un evento 'video_in_modal',
 * lo cual pinta una modal con el video afectado al pulsar el play (p.e cashnexus)
 *
 * @method VIDEO_IN_MODAL
 */
const VIDEO_IN_MODAL=()=>{
  const $body=$(document.body);

  const INIT=()=>{
    EVENTOS.receive();
  },

  EVENTOS={
    /**
     * Control de recepcion de los datos por evento
     *
     * @method EVENTOS.receive
     */
    receive:()=>{

      // Evento que se lanza desde sgt CMP_VIDEO_IN_MODAL()
      // con los datos del video a pintar en la modal
      $body.on("video_in_modal",(e,datos_video)=>{
        // Opciones pora modal
        const options={
          $btn_lanzador_modal : null,                // boton lanzador de la modal
          modal_data          : {},                  // carga de datos para uso en la modal
          modal_class         : "modal_con_video",   // clase discriminadora
          modal_size          : "modal-md", // tamaño de la modal (md mediana por defecto, sm pequeña, xl grande,modal-total para toda la vista)
          modal_type          : "modal_default",     // tipo de modal
          modal_title         : datos_video.video_title, // html para el title
          modal_content       : TMPL.video_construct(datos_video),         // html para contenido
          modal_footer        : "",                  // html para el footer
          events              : {
            on_open  : TMPL.modal_callback_on_open,    // Fn a ejecutar en la accion open
            on_close : TMPL.modal_callback_on_close,   // Fn a ejecutar en la accion close
          }
        };
        SGT_CMP_MODALS(options);
      });
    },
  },
  TMPL={

    /**
     * Callback para la modal en on_open
     *
     * @method TMPL.modal_callback_on_open
     *
     * @param {obj} data_modal Datos de la modal afectada recibidos en el cb on_open
     */
    modal_callback_on_open:(data_modal)=>{
      //console.log("[main.js] TMPL.modal_callback_on_open() data_modal",data_modal);
      // pause para los iframes youtube
      const $iframes=$body.find('iframe[data-source="youtube"]');
      $.each($iframes,function(i,e){
        e.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      });

      // pause para los videos HTML5
      // Asi se puede abrir la modal con la instancia y luego play en la modal
      const $videos=$body.find("video");
      $.each($videos,function(i,e){
        e.pause();
      });
    },

    /**
     * Callback para la modal en on_close
     *
     * @method TMPL.modal_callback_on_close
     *
     * @param {obj} data_modal Datos de la modal afectada recibidos en el cb on_open
     */
    modal_callback_on_close:(data_modal)=>{
    //console.log("[main.js] TMPL.modal_callback_on_close() data_modal",data_modal);
    },

    /**
     * Construccion de la capa de video para realizar la insercion
     *
     * @method TMPL.video_construct
     *
     * @param {object} datos_video Datos del video
     *
     * @return {str} video_transform Html del video a insertar
     */
    video_construct:(datos_video)=>{

      let sources_html="";
      const vids=datos_video.element.children;
      for( var i = 0; i < vids.length; i++ ){
        const src=vids.item(i).getAttribute('src');
        const type=vids.item(i).getAttribute('type');
        sources_html+=`<source src="${src}" type="${type}">`;
      }
      const video_options={
        class     : "video_in_modal",
        controls  : datos_video.element.getAttribute("controls"),
        muted     : datos_video.element.getAttribute("muted"),
      };
      const video_transform=`<video class="${video_options.class}" controls="${video_options.controls}" muted="${video_options.muted}">
        ${sources_html}
      </video>`;
      return video_transform;
    },
  };

  INIT();
};

/**
 * tagueo de componentes sgtCatalog
 *
 * @Object sgtCatalog_Tagging_Components
 * @property nameEventGeneral Nombre del evento a registrar, para que otros servicios se suscriban a el.
 * @property eventCategory Nombre de la categoria que se va a propargar.
 * @property elementsTagging: lista de elementos que vamos a querer tagguear.
 *           @property querySelector para buscar los elementos html que queremos tratar.
 *           @property eventName Nombre del evento se va a propargar.
 *           @property text Texto estático que se quiere propagar.
 *           @property nameComponent nombre del componente que estamos taggueando. 
 * @method init arranca el proceso principal, para los elementos que se pueden tagguear de incio, es decir están cargados en el DOM
 * @method getClickExternalLinks (elmenttagging) registra un evento de tipo click external links, solo enlaces externos.
 * @method getClickElement (elmenttagging) registra un evento de tipo click element.
 * @method registerClickElement (Event, elmenttagging, element html)
 * @method registerClickElement (Event, elmenttagging, element html)
 * @method checkURL (url), valida si la url es externa o interna
 * @method sgt_Catalog_SendEvent (nameEvent,detail) envia un evento de tipo nameEventGeneral, con los valores recibidos en el detail.
 */
const sgtCatalog_Tagging_Components = {
    nameEventGeneral:"evSendEvent", 
    eventCategory:"aem_info_components", 
    elementsTagging:[
       {querySelector:"[data-analytics-click_external_link='1']",eventName:"click_external_link",nameComponent:"All Components"},
       {querySelector:"[data-analytics-click_external_link='1'] a",eventName:"click_external_link",nameComponent:"All Components"},
       {querySelector:"[data-analytics-click_element='1']",eventName:"click_element",text:"Click en RRSS ",nameComponent:"All Components"},
    ],
    init: function () {
        sgtCatalog_Tagging_Components.elementsTagging.forEach(elementTagging=>
        {
            switch(elementTagging.eventName)
            {
                case 'click_element':
                 this.getClickElement(elementTagging);
                break;
                default:
                 this.getClickExternalLinks(elementTagging) ;
            }  
        });
    },
    getClickExternalLinks: function (elementTagging) {
       let listaNodos=document.querySelectorAll(elementTagging.querySelector);
       listaNodos.forEach(element => 
        {
            if (element.hasAttribute("href")) {    
                const url = element.getAttributeNode("href").value;    
                if (sgtCatalog_Tagging_Components.checkURL(url)) {
                    element.addEventListener("click", function (event){
                        sgtCatalog_Tagging_Components.registerClickExternalLinks(elementTagging,element)},
                        false);
                }
            }
        });
    },
    getClickElement: function (elementTagging) {
        let listaNodos=document.querySelectorAll(elementTagging.querySelector);
        listaNodos.forEach(element => 
         {
            element.addEventListener("click", function (event){sgtCatalog_Tagging_Components.registerClickElement(elementTagging,element)}, false);
      
         });
     },
    registerClickExternalLinks:function(elementTagging,element){
        const obj = {
            event_name: elementTagging.eventName,
            event_category: sgtCatalog_Tagging_Components.eventCategory,
            link_url:element.href,
            link_name:element.innerText,
          };
          sgtCatalog_Tagging_Components.sgt_Catalog_SendEvent(sgtCatalog_Tagging_Components.nameEventGeneral,obj);
    },
    registerClickElement:function(elementTagging,element){
        const obj = {
            event_name: elementTagging.eventName,
            event_category: sgtCatalog_Tagging_Components.eventCategory,
            event_label:elementTagging.text+element.href,
          };
          sgtCatalog_Tagging_Components.sgt_Catalog_SendEvent(sgtCatalog_Tagging_Components.nameEventGeneral,obj);
    },
    checkURL : function (url) {
        const hostname = location.hostname;
        let urlExterna=false;
        if(/(http(s?)):\/\//gi.test(url) && url.indexOf(hostname)=== -1) {
            urlExterna=true;
        }
        return urlExterna;
     }, 
     sgt_Catalog_SendEvent: function (nameEvent,detail)
    {
        let event;
        event=new CustomEvent(nameEvent,{
            detail:detail,
            bubbles:false,
            cancelable:false
        });
        document.dispatchEvent(event);
    },
};
document.addEventListener('DOMContentLoaded', function() {
    sgtCatalog_Tagging_Components.init();
 });
/**
 * @doc ctrl-cookies.js
 * 
 * @def Gestiona la vista de elementos pintados a través de la posible no aceptación de cookies
 * 
 * @observaciones Lanzamiento se aplica a través del site
 */

// @TODO EN PROCESO DE DESARROLLO falta prueba con elementos reales, solo funciona con tag video html

/**
 * @method SGT_CTRL_ELEMENTS_FOR_COOKIES
 * 
 * @param {obj} opts : opciones descritas inline
 */
// jshint esnext: false,  esversion: 11, jquery:false
if (typeof SGT_CTRL_ELEMENTS_FOR_COOKIES === 'undefined'){
  const SGT_CTRL_ELEMENTS_FOR_COOKIES = (options) => {

    const defaults = {
      debug: false,
      elements: [
        {
          name       : "video_html",         // tipo de elemento
          cont_class : [".cmp-video"],       // clases de los contenedores padre sobre los que actuar
          action     : "display",            // accion a realizar (remove: elimina la capa)
          add_class  : "video_no_cookies",   // Si existe se añade esta clase a la capa cont_class
          html: '<div class="no_cookies"><span>VIDEO: NO SIN COOKIES ACEPTADAS</span></div>', // Si existe se inserta este html en la capa cont_class a efectos de maquetacion
        },
        {
          name       : "google-maps",              // tipo de elemento
          cont_class : [".cont_iframe"],           // clases de los contenedores padre sobre los que actuar
          action     : "display",                  // accion a realizar (display: oculta la capa con display:none)
          add_class  : "google-maps_no_cookies",   // Si existe se añade esta clase a la capa cont_class
          html: '<div class="no_cookies"><span>GOOGLE-MAPS: NO SIN COOKIES ACEPTADAS</span></div>', // Si existe se inserta este html en la capa cont_class a efectos de maquetacion
        },
        {
          name       : "youtube",              // tipo de elemento
          cont_class : [".cont_iframe"],       // clases de los contenedores padre sobre los que actuar
          action     : "display",              // accion a realizar (display: oculta la capa con display:none)
          add_class  : "youtube_no_cookies",   // Si existe se añade esta clase a la capa cont_class
          html: '<div class="no_cookies"><span>YOUTUBE: NO SIN COOKIES ACEPTADAS</span></div>', // Si existe se inserta este html en la capa cont_class a efectos de maquetacion
        },
      ]
    };

    const opts = Object.assign({}, defaults, options);

    const $body = document.body;

    if (opts.debug) {
      console.log("SGT_CTRL_ELEMENTS_FOR_COOKIES() => opts:", opts);
    }

    // Si es un iframe es modo edicion y se retorna
    const isInframe=(window === window.parent) ? false : true;
    if(isInframe && opts.debug){
      console.log("SGT_CTRL_ELEMENTS_FOR_COOKIES() MODO EDICION:",isInframe);
      return;
    }

    const INIT = () => {
      TMPL.prepare();
    },

    TMPL = {

      prepare: () => {

        // recorre opciones
        opts.elements.forEach((element) => {
          // recorre clases
          element.cont_class.forEach((item) => {
            // recorre elementos del dom si hay
            const $items = $body.querySelectorAll(item);
            if ($items.length) {
              $items.forEach($item => {
                // añade clase al contenedor
                $item.classList.add(element.add_class);
                switch (element.name) {

                  case 'video_html':{
                    const $video = $item.querySelector("video");
                    // @TODO si es anuimacion ???
                    const isAnimation=OPS.video_isAnimation($video);
                    if(!isAnimation){
                      // si el video está cargado
                      if ($video.readyState >=3) {
                        TMPL.maneja_capa($item, $video, element);
                      }
                      else {
                        // ó al finalizar la carga del video
                        $video.addEventListener('loadedmetadata', TMPL.maneja_capa.bind(null, $item, $video, element));
                      }
                    }
                    else{
                      if (opts.debug) {
                        console.log("SGT_CTRL_ELEMENTS_FOR_COOKIES() => TMPL.prepare() ES UNA ANIMACION:", $video);
                      }
                    }
                  }
                  break;
                  case 'google-maps':{
                    //TMPL.maneja_capa($item, $capa_gmaps, element);
                  }
                  break;
                  case 'youtube':{
                    const $video_youtube = $item.querySelector("iframe");
                    // si realmente es un video de youtube
                    if ($video_youtube.src.includes('youtube')) {
                      // y esta cargado
                      if ($video_youtube.contentWindow.document.readyState === 'complete') {
                        TMPL.maneja_capa($item, $video_youtube, element);
                      }
                      else {
                        // desde video-stream.js se aplica evento sobre el contenedor para 
                        // desencadenar accion cuando el video esté cargado
                        $video_youtube.parentNode.addEventListener('youtube_onReady',TMPL.maneja_capa(null,$item, $video_youtube, element));
                      }
                    }
                    else {
                      if (opts.debug) {
                        console.log("SGT_CTRL_ELEMENTS_FOR_COOKIES() => TMPL.prepare() NO ES YOUTUBE:", $video_youtube.src);
                      }
                    }
                  }
                  break;
                  default:

                }

              });
            }
          });
        });

      },

      /**
       * Gestiona la aplicacion de variables para los estilos y 
       * aplica el html interno del contenedor definidio
       * 
       * @method TMPL.maneja_capa
       * 
       * @param {dom object} $cont : contenedor
       * @param {dom object} $item : elemento del que obtener dimensiones
       * @param {object} element : opciones configuradas para el elemento
       */
      maneja_capa : ($cont, $item, element) => {
        OPS.ctrl_elem_dimms($cont, $item);
        if (element.action === 'remove') {
          $cont.innerHTML = '';
        }
        else{
          OPS.oculta_internos($cont);
        } 
        // pinta el html configurado en las opciones
        $cont.innerHTML += element.html;
      },
      

    },

    OPS = {
      /**
       * Comprueba si el video del tag <video> es una animacion
       * 
       * @method OPS.video_isAnimation()
       * 
       * @param {dom object} $video: Video afectado
       * 
       * @return {bool} retorno
       * 
       * @observaciones
       *    - los navegadores Chromium no permiten la reproducción automática en la mayoría de los casos.
       *      Sin embargo, siempre se permite la reproducción automática silenciada.
       */
      video_isAnimation:($video)=>{
        let retorno=false;
        const controls = $video.getAttribute("controls") !== null||$video.controls === "true";
        const autoplay = $video.getAttribute("autoplay") !== null||$video.autoplay === "true";
        const loop     = $video.getAttribute("loop")     !== null||$video.loop     === "true";
        const muted    = $video.getAttribute("muted")    !== null||$video.muted    === "true";
        // Si no lleva controls pero si autoplay loop muted es animacion
        if(!controls && autoplay && muted){
          retorno=true;
        }
        return retorno;
      },

      /**
       * Aplica variables para estilos con las dimensiones del contenedor hijo en un contenedor padre dado
       * 
       * @method OPS.ctrl_elem_dimms
       * 
       * @param {dom object} $cont : contenedor
       * @param {dom object} $elem : elemento donde controlar la dimension
       */
      ctrl_elem_dimms:($cont,$elem)=>{
        const dimms=$elem.getBoundingClientRect();
        $cont.style.setProperty('--old_width',dimms.width+"px");
        $cont.style.setProperty('--old_height',dimms.height+"px");
      },

      /**
       * Oculta los hijos directos de un contenedor dado
       * 
       * @method OPS.oculta_internos
       * 
       * @param {dom object} $cont : contenedor donde aplicar display:none a sus hijos directos
       */
      oculta_internos:($cont)=>{
        const $childrens = $cont.children;
        for (let i = 0; i < $childrens.length; i++) {
          // puede haber script, etc... que no tengan style
          if ($childrens[i].style) {
            $childrens[i].style.display = 'none';
          }
        }
      },


    };

    INIT();

  };
}
$(document).ready(function () {
    //Calcular un margin-top que se corresponda a la altura del toolbox
    var deviceWidth;
    deviceWidth = $(document).width();

    containerLayout();
    removeContainerStory();
    resizeIframe();

    //Solucion para eliminar p's vacios en texto enriquecido por front
    var containerToSearchIn = $('.cmp-text');
    var emptyElementsToRemove = 'p';
    eliminateEmpty(containerToSearchIn, emptyElementsToRemove);

});
$(window).resize(function () {
    //Calcular un margin-top que se corresponda a la algura del toolbox
    var deviceWidth;
    deviceWidth = $(document).width();
    if ($('.banner-complex').length != 0)
        bannerComplexPosition = $('.banner-complex').offset().top;
    if (deviceWidth < 1006) {
        if ($('.banner-complex').length != 0 && bannerComplexPosition != 0)
            $('body').css('margin-top', $('.menu-lateral .menu-level1').height());
    } else
        $('body').css('margin-top', '0');
});

$(window).on('load', function () {
    $('#changeCookieConfig').click(function () {
        $('body').addClass('modal-open');
        $('#modal-cookie').css({'display': 'block'});
    })

    setTimeout(function () {
        $('#changeCookieConfigHome').click(function (event) {
            utag.gdpr.showConsentPreferences();
            if ($('body').hasClass('modal-open'))
                $('body').removeClass('modal-open');
            else
                $('body').addClass('modal-open');

            $('#modal-cookie').css({'display': 'block'});
            event.stopPropagation();
        })
    }, 500)

    // Poner paddings en la imagen del texto enriquecido
    let styleImg = $('.cmp-text img').css("float");
    let paddingImg = $('.cmp-text img');
    if (styleImg == 'none')
        paddingImg.css('padding', '8px');
    else if (styleImg == 'right')
        paddingImg.css('padding', '8px 0 8px 8px');
    else if (styleImg == 'left')
        paddingImg.css('padding', '8px 8px 8px 0');

    objectFitImages(false, {
        watchMQ: true,
        skipTest: true
    });
    resizeIframe();

    marginBody();
});

function marginBody() {
    let bannerComplexPosition;
    if ($('.banner-complex').length != 0)
        bannerComplexPosition = $('.banner-complex').offset().top;
    if ($(window).width() < 1006) {
        if (bannerComplexPosition != 0)
            $('body').css('margin-top', $('.menu-lateral .menu-level1').height());
        else if (bannerComplexPosition == 'undefined')
            $('body').css('margin-top', $('.menu-lateral .menu-level1').height());
    }
}

function inputEffect() {
    // I N P U T S
    $(".input__container input").val("");

    $(".input-effect input").focusout(function () {
        if ($(this).val() != "")
            $(this).addClass("has-content");
        else
            $(this).removeClass("has-content");
    });

}

function dropdownEffect() {
    // D R O P D O W N S
    $("*:not(.dropdown__container--filter)").on("click", function () {
        if ($(this).find('.dropdown__items').is(":visible"))
            $(this).find('.dropdown__items').hide();
    });

    $(".dropdown__container--filter").on("click", function (event) {

        if ($(this).attr('data-readonly') == undefined) {
            if ($(this).find('.dropdown__items').is(":visible")) {
                $('.dropdown__items').hide();
                $(".dropdown__container").removeClass("open");
            } else {
                $(".dropdown__container").removeClass("open");
                $('.dropdown__items').hide();
                $(this).find('.dropdown__items').show();
            }
        }
        event.stopImmediatePropagation();
    });
    $(".dropdown__container--filter").on("click", function (event) {
        event.stopPropagation();
    });

    $('.emissions-filters .dropdown-menu, .contacts-filters .dropdown-menu').on('click', 'a', function (e) {
        let $dropdown = $(this).parents('.dropdown__container--filter');
        let $valueText = $dropdown.find('.dropdown__items a:first-child').text();

        e.preventDefault();

        if ($dropdown.find('a:first-child').hasClass('active'))
            $dropdown.find("input").val("");
        else
            $dropdown.find("input").val($valueText);

    });

    $('.filter-wrapper').on('click', '.dropdown__container--filter', function () {
        $('.dropdown__items').not($(this)).hide();
        $(this).find('.dropdown__items').toggle();
    });

    $("#datepicker").on("change paste keyup", function () {
        if ($('input#voDate').val()) {
            let $placeholderValue = $('#datepicker').attr('placeholder');
            $('.input-container__datepicker .input--hidden').val($placeholderValue);
            $('.input-container__datepicker .input--hidden').css('display', 'block');
        }
    });

    //cerrar select click fuera
    $(document).on("click", function (e) {
        var select = $(".block-filter");
        if (!select.is(e.target) && select.has(e.target).length === 0)
            $(".block-filter-ext, .block-filter-inter").addClass("noActive").hide();
    });
}

function containerLayout() {
    let $responseGridParent = $('.columns.aem-GridColumn');
    let $responseGridCustomLayout = $('.columns-component');
    if ($responseGridParent.length != 0) {
        $responseGridParent.each(function () {
            let $columns = $(this).find($responseGridCustomLayout).find("[class^='col-']");
            if ($columns.length > 1) {
                $responseGridCustomLayout.find('.container-page').removeClass();
                $responseGridCustomLayout.find('.aem-Grid.aem-Grid--12:first').addClass('first-item');
                $responseGridCustomLayout.find('.aem-Grid.aem-Grid--12:last').addClass('last-item');
            }
        });
    }
}

//Quitar el container-page a los componentes que están dentro de una Story
function removeContainerStory() {
    $('.story').find('.full-width-layout .content-story').each(function () {
        $(this).find('.container-page').removeClass();
    });
}

// libreria para que funcione el polyfill
/*! npm.im/object-fit-images 3.2.4 */
var objectFitImages = (function () {
    'use strict';

    var OFI = 'fregante:object-fit-images';
    var propRegex = /(object-fit|object-position)\s*:\s*([-.\w\s%]+)/g;
    var testImg = typeof Image === 'undefined' ? {style: {'object-position': 1}} : new Image();
    var supportsObjectFit = 'object-fit' in testImg.style;
    var supportsObjectPosition = 'object-position' in testImg.style;
    var supportsOFI = 'background-size' in testImg.style;
    var supportsCurrentSrc = typeof testImg.currentSrc === 'string';
    var nativeGetAttribute = testImg.getAttribute;
    var nativeSetAttribute = testImg.setAttribute;
    var autoModeEnabled = false;

    function createPlaceholder(w, h) {
        return ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='" + w + "' height='" + h + "'%3E%3C/svg%3E");
    }

    function polyfillCurrentSrc(el) {
        if (el.srcset && !supportsCurrentSrc && window.picturefill) {
            var pf = window.picturefill._;
            // parse srcset with picturefill where currentSrc isn't available
            if (!el[pf.ns] || !el[pf.ns].evaled) {
                // force synchronous srcset parsing
                pf.fillImg(el, {reselect: true});
            }

            if (!el[pf.ns].curSrc) {
                // force picturefill to parse srcset
                el[pf.ns].supported = false;
                pf.fillImg(el, {reselect: true});
            }

            // retrieve parsed currentSrc, if any
            el.currentSrc = el[pf.ns].curSrc || el.src;
        }
    }

    function getStyle(el) {
        var style = getComputedStyle(el).fontFamily;
        var parsed;
        var props = {};
        while ((parsed = propRegex.exec(style)) !== null)
            props[parsed[1]] = parsed[2];
        return props;
    }

    function setPlaceholder(img, width, height) {
        // Default: fill width, no height
        var placeholder = createPlaceholder(width || 1, height || 0);

        // Only set placeholder if it's different
        if (nativeGetAttribute.call(img, 'src') !== placeholder)
            nativeSetAttribute.call(img, 'src', placeholder);
    }

    function onImageReady(img, callback) {
        // naturalWidth is only available when the image headers are loaded,
        // this loop will poll it every 100ms.
        if (img.naturalWidth)
            callback(img);
        else
            setTimeout(onImageReady, 100, img, callback);
    }

    function fixOne(el) {
        var style = getStyle(el);
        var ofi = el[OFI];
        style['object-fit'] = style['object-fit'] || 'fill'; // default value

        // Avoid running where unnecessary, unless OFI had already done its deed
        if (!ofi.img) {
            // fill is the default behavior so no action is necessary
            if (style['object-fit'] === 'fill') {
                return;
            }

            // Where object-fit is supported and object-position isn't (Safari < 10)
            if (!ofi.skipTest && // unless user wants to apply regardless of browser support
                supportsObjectFit && // if browser already supports object-fit
                !style['object-position'] // unless object-position is used
            ) {
                return;
            }
        }

        // keep a clone in memory while resetting the original to a blank
        if (!ofi.img) {
            ofi.img = new Image(el.width, el.height);
            ofi.img.srcset = nativeGetAttribute.call(el, "data-ofi-srcset") || el.srcset;
            ofi.img.src = nativeGetAttribute.call(el, "data-ofi-src") || el.src;

            // preserve for any future cloneNode calls
            // https://github.com/fregante/object-fit-images/issues/53
            nativeSetAttribute.call(el, "data-ofi-src", el.src);
            if (el.srcset) {
                nativeSetAttribute.call(el, "data-ofi-srcset", el.srcset);
            }

            setPlaceholder(el, el.naturalWidth || el.width, el.naturalHeight || el.height);

            // remove srcset because it overrides src
            if (el.srcset) {
                el.srcset = '';
            }
            try {
                keepSrcUsable(el);
            } catch (err) {
                if (window.console) {
                    console.warn('https://bit.ly/ofi-old-browser');
                }
            }
        }

        polyfillCurrentSrc(ofi.img);

        el.style.backgroundImage = "url(\"" + ((ofi.img.currentSrc || ofi.img.src).replace(/"/g, '\\"')) + "\")";
        el.style.backgroundPosition = style['object-position'] || 'center';
        el.style.backgroundRepeat = 'no-repeat';
        el.style.backgroundOrigin = 'content-box';

        if (/scale-down/.test(style['object-fit'])) {
            onImageReady(ofi.img, function () {
                if (ofi.img.naturalWidth > el.width || ofi.img.naturalHeight > el.height)
                    el.style.backgroundSize = 'contain';
                else
                    el.style.backgroundSize = 'auto';
            });
        } else
            el.style.backgroundSize = style['object-fit'].replace('none', 'auto').replace('fill', '100% 100%');

        onImageReady(ofi.img, function (img) {
            setPlaceholder(el, img.naturalWidth, img.naturalHeight);
        });
    }

    function keepSrcUsable(el) {
        var descriptors = {
            get: function get(prop) {
                return el[OFI].img[prop ? prop : 'src'];
            },
            set: function set(value, prop) {
                el[OFI].img[prop ? prop : 'src'] = value;
                nativeSetAttribute.call(el, ("data-ofi-" + prop), value); // preserve for any future cloneNode
                fixOne(el);
                return value;
            }
        };
        Object.defineProperty(el, 'src', descriptors);
        Object.defineProperty(el, 'currentSrc', {
            get: function () {
                return descriptors.get('currentSrc');
            }
        });
        Object.defineProperty(el, 'srcset', {
            get: function () {
                return descriptors.get('srcset');
            },
            set: function (ss) {
                return descriptors.set(ss, 'srcset');
            }
        });
    }

    function hijackAttributes() {
        function getOfiImageMaybe(el, name) {
            return el[OFI] && el[OFI].img && (name === 'src' || name === 'srcset') ? el[OFI].img : el;
        }

        if (!supportsObjectPosition) {
            HTMLImageElement.prototype.getAttribute = function (name) {
                return nativeGetAttribute.call(getOfiImageMaybe(this, name), name);
            };

            HTMLImageElement.prototype.setAttribute = function (name, value) {
                return nativeSetAttribute.call(getOfiImageMaybe(this, name), name, String(value));
            };
        }
    }

    function fix(imgs, opts) {
        var startAutoMode = !autoModeEnabled && !imgs;
        opts = opts || {};
        imgs = imgs || 'img';

        if ((supportsObjectPosition && !opts.skipTest) || !supportsOFI)
            return false;

        // use imgs as a selector or just select all images
        if (imgs === 'img') {
            imgs = document.getElementsByTagName('img');
        } else if (typeof imgs === 'string') {
            imgs = document.querySelectorAll(imgs);
        } else if (!('length' in imgs)) {
            imgs = [imgs];
        }

        // apply fix to all
        for (var i = 0; i < imgs.length; i++) {
            imgs[i][OFI] = imgs[i][OFI] || {skipTest: opts.skipTest};
            fixOne(imgs[i]);
        }

        if (startAutoMode) {
            document.body.addEventListener('load', function (e) {
                if (e.target.tagName === 'IMG') {
                    fix(e.target, {
                        skipTest: opts.skipTest
                    });
                }
            }, true);
            autoModeEnabled = true;
            imgs = 'img'; // reset to a generic selector for watchMQ
        }

        // if requested, watch media queries for object-fit change
        if (opts.watchMQ) {
            window.addEventListener('resize', fix.bind(null, imgs, {
                skipTest: opts.skipTest
            }));
        }
    }

    fix.supportsObjectFit = supportsObjectFit;
    fix.supportsObjectPosition = supportsObjectPosition;

    hijackAttributes();

    return fix;

}());

function resizeIframe() {
    var height = document.getElementsByTagName("html")[0].offsetHeight;
    window.parent.postMessage(["setHeight", height], "*");
}

function eliminateEmpty(containerElement, emptyTag) {
    containerElement.each(function () {
        $(this).children(emptyTag).each(function () {
            var elem = $(this);
            if (elem.html() === "") elem.remove();
        });
    })
}


function hideEmptyPagination() {
    let paginationWrapper = $('.pagination-wrapper .pagination');
    paginationWrapper.each(function () {
        if ($(this).css('height') <= 0) {
            $(this).css('display', 'none');
        }
    });
}



// Extend jQuery with custom function to serialize form fields and convert into JSON object.
// Returns JSON object
// From: https://stackoverflow.com/a/39248551
$.fn.getForm2obj = function () {
    var _t = this, objName = '_';
    eval(objName + ' = {}');
    this.c = function (k, v) {
        eval("c = typeof " + k + ";");
        if (c == 'undefined') _t.b(k, v);
    }
    this.b = function (k, v, a = 0) {
        if (a) eval(k + ".push(" + v + ");");
        else {
            var _temp = k.replace(objName + '[\'', '').replace('\']', '');
            var keys = k.replace(/^_\['/, '').replace(/']$/, '').split('\'][\'');
            if ($('[name="' + _temp + '"]').is('textarea')) _[_temp] = v.toString().slice(1, -1);
            else if (keys.length > 1) {
                if ($('[name="' + _temp.replace(/\['/g, '[').replace(/']/g, ']') + '"]').is('textarea')) {
                    let schema = _;
                    for (var ii = 0; ii < keys.length - 1; ii++) {
                        var elem = keys[ii];
                        if (!schema[elem]) schema[elem] = {};
                        schema = schema[elem];
                    }
                    schema[keys[keys.length - 1]] = v.toString().slice(1, -1);
                } else eval(k + "=" + v + ";");
            } else eval(k + "=" + v + ";");
        }
    };
    $.map(this.serializeArray(), function (n) {
        let _nVal = n['value'];
        if (typeof _nVal === 'string') _nVal = _nVal.replace(/'/g, '').replace(/\\/g, '\\\\');
        if (n.name.indexOf('[') > -1) {
            var keys = n.name.match(/[a-zA-Z0-9_]+|(?=\[\])/g), le = Object.keys(keys).length, tmp = objName;
            $.map(keys, function (key, i) {
                if (key == '') {
                    eval("ale = Object.keys(" + tmp + ").length;");
                    if (!ale) _t.b(tmp, '[]');
                    if (le == (i + 1)) _t.b(tmp, "'" + _nVal + "'", 1);
                    else _t.b(tmp += "[" + ale + "]", '{}');
                } else {
                    _t.c(tmp += "['" + key + "']", '{}');
                    if (le == (i + 1)) _t.b(tmp, "'" + _nVal + "'");
                }
            });
        } else _t.b(objName + "['" + n['name'] + "']", "'" + _nVal + "'");
    });
    return _;
}

function getSearchParams() {
    let searchQuery = window.location.search.substring(1);
    let temp = searchQuery.split('&');
    let obj = {
        get: function (param) {
            return this.values[param];
        }, values: {}
    };

    for (let ii = 0; ii < temp.length; ii++) {
        let keyValue = temp[ii].split('=');
        obj.values[decodeURIComponent(keyValue[0])] = keyValue[1] === undefined ? true : decodeURIComponent(keyValue[1]);
    }

    return obj;
};

$(document).ready(function () {
    if ($('form').length>0 && typeof(forms)==="object"){
        forms.init();
    }
        
});

