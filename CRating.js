/* global DOMError */
/*
    Web Component `<c-rating name="" value="" use="" min="" max="">`
        - `name`: je volitelné a určuje jména imputů (defaultně: `name_default+name_count++`)
        - `disabled`: určuje aktivnost inputů (lze měnit i dynamicky po vytvoření)
        - `value`: určuje počáteční hodnotu hodnocení (lze měnit i dynamicky po vytvoření)
        - `use`/`min`+`max`
            - určuje možnosti k hodnocení (resp. jejich popisky, `value` vždy odpovídá indexu od 0)
            - `use`: ID `<c-rating-buttons>…` obsahující textové popisky možností
            - `min`/`max`: vygeneruje číselné štítky (např.: 1/3 → 1,2,3), defaultně 1/5
        - `.onchange`/událost `change` (analog. k inputům) vrací hodnotu konkrétního imputu (např.: `({ target })=> console.log(target.value)`)
        - stylování (např.) `c-rating …; c-rating input …; c-rating input:checked + label …; c-rating label`
 */
(function CRating(d){
    if(d.readyState==="loading") return d.addEventListener("DOMContentLoaded", CRating.bind(this, d));
    const name_default= "CRating";
    let name_count= 0;
    class CRatingButtonsElement extends HTMLElement{
        static get tag_name(){ return "c-rating-buttons"; }
        get texts(){ return Array.from(this.children).map(({ innerText })=> innerText); }
        constructor(){ super(); this.style.display= "none"; }
    }
    class CRatingElement extends HTMLElement{
        static get tag_name(){ return "c-rating"; }
        connectedCallback(){
            if(!this.hasAttribute("name"))
                this.setAttribute("name", name_default+name_count++);
            this._state= 1; //≡"connected";
            this._texts().map(this._createInput, this).forEach(el=> this.appendChild(el));
            return this._refreshState();
        }
        /** @returns {string[]|number[]} */
        _texts(){
            if(this.hasAttribute("use")){
                const el= d.getElementById(this.getAttribute("use"));
                if(!(el instanceof CRatingButtonsElement))
                    throw new DOMError(`${el} is not instance of ${CRatingButtonsElement}`);
                return el.texts;
            }
            const [ min= 1, max= 5 ]= [ "min", "max" ].map(n=> Number(this.getAttribute(n)));
            return Array.from({ length: max-min }).map((_, i)=> i+min);
        }
        _createInput(text, value){
            const /* fragment: `<><input><label><>`; name a id z hl. name */
                el_fragment= d.createDocumentFragment(),
                name= this.getAttribute("name"),
                id= name+this.__inputs++;
            const { disabled }= this;
            el_fragment.appendChild(Object.assign(d.createElement("input"), {
                type: "radio", checked: this.value===value,
                onchange: this._changeEvent.bind(this),
                id, name, value, disabled
            }));
            el_fragment.appendChild(Object.assign(d.createElement("label"), {
                htmlFor: id, textContent: text
            }));
            return el_fragment;
        }
        _changeEvent(ev){
            this.value= ev.target.value;
            return this.dispatchEvent(new Event("onchange", ev));
        }
        /* propojeni html `value="…"` a JS `element.value` */
        static get observedAttributes(){ return [ "value" ]; }
        get value(){ return this.hasAttribute("value") ? Number(this.getAttribute("value")) : -1; }
        set value(val){ return this.setAttribute("value", val); }
        get name(){ return this.getAttribute("name"); }
        set name(val){ return this.setAttribute("name", val); }
        get disabled(){ return this.hasAttribute("disabled"); }
        set disabled(bool){ return bool ? this.setAttribute("disabled", true) : this.removeAttribute("disabled"); }
        attributeChangedCallback(_, val_old, val_new){
            if(val_old===val_new) return false;
            return this._refreshState();
        }
        /* propojeni s inputama */
        _refreshState(){
            if(!this._state) return 0;//krkolomnost kvuli tomu, ze attributeCh… se muze zavolat pred samotnym vytvorenim <c-rating>
            const { value, disabled }= this;
            Array.from(this.getElementsByTagName("input"))
                .forEach((el, i)=> Object.assign(el, { disabled, checked: i===value }));//indexujeme od 0, takze OK
            return 1;
        }
        
        constructor(){ super(); this.__inputs= 0; }
    }
    
    customElements.define(CRatingButtonsElement.tag_name, CRatingButtonsElement);
    customElements.define(CRatingElement.tag_name, CRatingElement);
})(document);