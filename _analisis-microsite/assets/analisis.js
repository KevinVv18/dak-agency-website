// Comportamiento compartido de los entregables de análisis de marca:
// barra de progreso y aparición al hacer scroll.
// El ocultado inicial lo activa la clase .js que pone el <head>; sin JS la página
// se ve completa a propósito.
(function(){
  function revelarTodo(){
    document.querySelectorAll('.rv').forEach(function(e){e.classList.add('in')});
    document.querySelectorAll('.bfill').forEach(function(b){b.style.width=b.dataset.pct+'%'});
  }
  try{
    var prog=document.getElementById('prog');
    function onScroll(){
      var h=document.documentElement.scrollHeight-window.innerHeight;
      prog.style.width=(h>0?(window.scrollY/h)*100:0)+'%';
    }
    addEventListener('scroll',onScroll,{passive:true});onScroll();

    var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
    if(!('IntersectionObserver' in window)||reduce){return revelarTodo()}

    var ioRespondio=false;
    var io=new IntersectionObserver(function(es){
      ioRespondio=true;
      es.forEach(function(e){
        if(!e.isIntersecting)return;
        e.target.classList.add('in');
        e.target.querySelectorAll('.bfill').forEach(function(b,i){
          setTimeout(function(){b.style.width=b.dataset.pct+'%'},120*i);
        });
        io.unobserve(e.target);
      });
    },{rootMargin:'0px 0px -12% 0px',threshold:.08});
    document.querySelectorAll('.rv').forEach(function(e){io.observe(e)});

    // Red de seguridad: el observer siempre emite una primera devolución por cada elemento
    // observado. Si a los 1,2 s no emitió NINGUNA, está roto y se muestra todo.
    // (Comprobar `.rv.in` en su lugar sería un falso positivo: arriba del todo no hay nada
    // que revelar todavía, y eso apagaría la animación en cada carga.)
    setTimeout(function(){ if(!ioRespondio) revelarTodo() },1200);
  }catch(err){ revelarTodo() }
})();
