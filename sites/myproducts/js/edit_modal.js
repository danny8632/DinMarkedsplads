class EditProduct {

    static display_edit(modal_data, categories) {

        if(typeof window.EditModal == "undefined")
        {
            window.EditModal = new EditProduct;
        }
    
        window.EditModal.init(modal_data, categories);
    }

    constructor() {

        this.modal = $(`#edit-modal`);

        this.data = {};

        this.categories = [];
    }


    init(modal_data, categories) {

        this.data = modal_data;

        this.categories = categories;

        this.render();

        this.bind_event_handlers();
    }



    bind_event_handlers() {

        if(this.is_bound) return;



        this.modal.on("click", ".modal-footer .close", () => {
            this.modal.toggleClass("hidden", true);
        })

        this.is_bound = true;
    }

    render() {

        this.modal.find("input, textarea").each((i, elm) => {
            $(elm).val(this.data[$(elm).attr("name")]);
        })

        let select = this.modal.find(`.category-select`);
    
        console.log(this.categories)

        if(this.categories.length == 0)
        {
            select.addClass("disable");
        }
        else
        {
            for (let i = 0, length = this.categories.length; i < length; i++) {
                const category = this.categories[i];
                
                let option = document.createElement("option");
                
                option.value = category.id;
                option.innerHTML = category.name;

                select.append(option)
            }

            select.val(this.data.categories[0]);
        }


        this.modal.toggleClass("hidden", false);
        
    }

}
