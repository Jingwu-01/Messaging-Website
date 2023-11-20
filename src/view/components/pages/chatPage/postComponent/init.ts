import PostComponent from ".";

export default function postComponentInit() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
<template id="post-template">
    <style>
        header {
            display: flex;
            gap: 5em;
            align-items: center;
        }
        time {
            font-size: 0.8rem;
        }
        #post-child-container{
            margin-left: 5em;
        }
        #post-user-text{
            font-size: 0.8rem;
        }
        #post-body{
            font-size: 1rem;
            margin: 0 0;
        }
        #hover-wrapper{
            flex: 1;
        }
        #buttons{
            display: flex; 
        }
    </style>
    <section>
        <header id="post-header">
            <p id="post-user-text"></p>
            <div id="hover-wrapper">
                <hover-component align="top">
                    <time id="post-time-short" slot="anchor-el"></time>
                    <time id="post-time-long" slot="hover-items"></time>
                </hover-component>
            </div>
        </header>
        <p id="post-body">    
            <!-- TODO: can also add additional HTML element(s) for buttons (reactions, replies)-->
        </p>
        <section id="buttons"> 
        <reply-button-component></reply-button-component> 
        <reaction-component></reaction-component> 
        </section> 
        <div id="post-child-container">
        </div>
    </section>
</template>
`
  );

  // a post element shuld look like
  //     <section>
  //     <header id="post-header">
  //      {username}
  //      <time>{post-time}</time>
  //     </header>
  //     <p id="post-body">
  //         {post-message}
  //     </p>
  // </section>

  customElements.define("post-component", PostComponent);
}
