let eventBus = new Vue()

Vue.component('product-tabs', {
    props: {
        shipping: {
            type: String,
            required: true,
        },
        details: {
            type: Array,
            required: true,
        },
        reviews: {
            type: Array,
            required: true,
        }
    },
    template: `
     <div>   
       <ul>
         <span class="tab"
               :class="{ activeTab: selectedTab === tab }"
               v-for="(tab, index) in tabs"
               :key="index"
               @click="selectedTab = tab"
         >{{ tab }}</span>
       </ul>
       
       <!-- Доп задание -->
       <div v-show="selectedTab === 'Reviews'">
         <p v-if="!reviews.length">There are no reviews yet.</p>
         
         <!-- фильтр по рейтингу -->
         <div v-if="reviews.length" class="rating-filter">
           <p>Filter by rating:</p>
           <div class="filter-buttons">
             <button 
               @click="filterRating = null" 
               :class="{ active: filterRating === null }"
             >All ({{ reviews.length }})</button>
             <button 
               v-for="rating in [5,4,3,2,1]" 
               :key="rating"
               @click="filterRating = rating"
               :class="{ active: filterRating === rating }"
             >{{ rating }} ★ ({{ getCountByRating(rating) }})</button>
           </div>
         </div>
         
         <!-- список фильтра -->
         <ul>
           <li v-for="review in filteredReviews" :key="review.id || review.name + review.rating">
             <p><strong>{{ review.name }}</strong> 
                <span class="rating-stars">*****</span>
                <span class="rating-value">{{ review.rating }}</span>
             </p>
             <p>{{ review.review }}</p>
             <p>Recommend: {{ review.recomend }}</p>
             <hr>
           </li>
         </ul>
       </div>
       
       <div v-show="selectedTab === 'Make a Review'">
         <product-review></product-review>
       </div>
       <div v-show="selectedTab === 'Shipping'">
         <p>Shipping: {{ shipping }}</p>  
       </div>
       <div v-show="selectedTab === 'Details'">
         <product-details :details="details"></product-details> 
       </div>
     </div>`,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review', 'Shipping', 'Details'],
            selectedTab: 'Reviews',
            filterRating: null  
        }
    },
    computed: {
        filteredReviews() {
            if (this.filterRating === null) {
                return this.reviews;
            }
            return this.reviews.filter(review => review.rating === this.filterRating);
        }
    },
    methods: {
        getCountByRating(rating) {
            return this.reviews.filter(review => review.rating === rating).length;
        }
    }
})

Vue.component('product-review', {
    props: {
        review: {
            required: true
        }
    },
    template: `
    <form class="review-form" @submit.prevent="onSubmit">
     <p>
       <label for="name">Name:</label>
       <input id="name" v-model="name" placeholder="name">
     </p>
    
     <p>
       <label for="review">Review:</label>
       <textarea id="review" v-model="review"></textarea>
     </p>
    
     <p>
       <label for="rating">Rating:</label>
       <select id="rating" v-model.number="rating">
         <option>5</option>
         <option>4</option>
         <option>3</option>
         <option>2</option>
         <option>1</option>
       </select>
     </p>
    
    <div>
        <p> Would you recommend this product?</p>
        <label >
            <input v-model="recomend" type="radio" name="1" value="yes">
            yes
        </label>
        <label >
            <input v-model="recomend" type="radio" name="1" value="no">
            no
        </label>
    </div>
     <p>
       <input type="submit" value="Submit"> 
     </p>
    <p v-if="errors.length">
        <b>Please correct the following error(s):</b>
        <ul>
           <li v-for="error in errors">{{ error }}</li>
        </ul>
    </p>
    
    
    </form> `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            errors: [],
            recomend: null,
        }
    },
    methods:{
        onSubmit() {
            if(this.name && this.review && this.rating && this.recomend) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recomend: this.recomend,
                    id: Date.now() + Math.random(),
                }
                eventBus.$emit('review-submitted', productReview)
                this.name = null
                this.review = null
                this.rating = null
                this.recomend = null
            } else {
                if(!this.name) this.errors.push("Name required.")
                if(!this.review) this.errors.push("Review required.")
                if(!this.rating) this.errors.push("Rating required.")
                if(!this.recomend) this.errors.push("Recomend required.")
            }
        },
        data() {
            return {
                name: null,
                review: null,
                rating: null,
                errors: [],
                recomend: null,

            }
        },

    },
})

Vue.component('product-details', {
    props: {
        details: {
            required: true
        }
    },
    template: `
    <ul>
        <li v-for="detail in details">{{ detail }}</li>
    </ul>`,
})


Vue.component('product', {
   props: {
       premium: {
           type: Boolean,
           required: true
       }
   },
    template: `
    <div class="product">
       <div class="product-image">
           <img :src="image" :alt="altText"/>
       </div>
       <div class="product-info">
           <h1>{{ title }}</h1>
           <p>{{sale}}</p>
           <p :style="inStock ? '' : 'text-decoration: line-through' " > 
                {{ inStock ? 'In stock' : 'Out of Stock' }}
            </p>
           <div
               class="color-box"
               v-for="(variant, index) in variants"
               :key="variant.variantId"
               :style="{ backgroundColor:variant.variantColor }"
               @mouseover="updateProduct(index)">           
            </div>
           <button v-on:click="addToCart" :disabled="!inStock"
           :class="{disabledButton: !inStock}">Add to cart</button>
           <div>
           <product-tabs :shipping="shipping" :reviews="reviews" :details="details"></product-tabs>
            `,
       data() {
           return {
                product: "Socks",
                brand: 'Vue Mastery',
                selectedVariant: 0,
                altText: "A pair of socks",
                details: ['80% cotton', '20% polyester', 'Gender-neutral'],
                reviews: [],
                variants: [
                    {
                        variantId: 2234,
                        variantColor: 'green',
                        variantImage: "./assets/vmSocks-green-onWhite.jpg",
                        variantQuantity: 10
                    },
                    {
                        variantId: 2235,
                        variantColor: 'blue',
                        variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                        variantQuantity: 0
                    }
                ],
                
            }        
        },
            methods: {
                addToCart() {
                    this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId);
                },
                // remoteCart() {
                //     this.$emit('delete-to-cart', this.variants[this.selectedVariant].variantId);
                // },
                updateProduct(index) {
                    this.selectedVariant = index;
                    console.log(index);
                },
            },    
            computed: {
                title() {
                    return this.brand + ' ' + this.product;
                },
                image() {
                    return this.variants[this.selectedVariant].variantImage;
                },
                inStock() {
                    return this.variants[this.selectedVariant].variantQuantity
                },
                shipping() {
                    if (this.premium) {return "Free";} 
                    else {return 2.99}
                },

            },
            mounted() {
                    eventBus.$on('review-submitted', productReview => {
                    this.reviews.push(productReview)
                })
                }
            
})      

let app = new Vue({
   el: '#app',
   data: {
       premium: true,
       cart: []
   },
   methods: {
        updateCart(id) {
            this.cart.push(id);
            },
        // remoteCart() {
        //     this.cart.pop();
        // }
    }

})

