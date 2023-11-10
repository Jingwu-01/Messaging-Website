import PostComponent from ".";

export default function postComponentInit() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
<template id="post-template">
    <style>
        time {
            margin-left: 5em
        }
        #post-child-container{
            margin-left: 5em
        }
    </style>
    <section>
        <header id="post-header">
        </header>
        <p id="post-body">    
            <!-- TODO: can also add additional HTML element(s) for buttons (reactions, replies)-->
        </p>
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
