import PostComponent from ".";

export default function postComponentInit() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
<template id="post-template">
    <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
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
        #post-buttons{
            display: flex; 
        }
        .reacted {
            border: solid;
        }
        edit-post-button-component[data-visible="true"]{
            display: inline-block
        }
        edit-post-button-component[data-visible="false"]{
            display: none
        }
        #post-all{
            background-color: null;
            border-radius: 0px;
        }

    </style>
    <section id="post-all">
        <header id="post-header">
            <p id="post-user-text"></p>
            <section id="hover-wrapper">
                <hover-component align="top">
                    <time id="post-time-short" slot="anchor-el"></time>
                    <time id="post-time-long" slot="hover-items"></time>
                </hover-component>
            </section>
        </header>
        <section id="post-body">    
            <!-- TODO: can also add additional HTML element(s) for buttons (reactions, replies)-->
        </section>
        <section id="post-buttons"> 
        </section> 
        <section id="post-child-container">
        </section>
    </section>
</template>
`,
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
