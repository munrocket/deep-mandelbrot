<div id="errorBox" class="modal">
  <div class="modal-background"></div>
  <div class="modal-content">
    <article class="message is-primary">
      <div class="message-header">
        <p id="errorHdr">Something went wrong</p>
        <button class="delete" aria-label="delete" onclick="document.getElementById('errorBox').classList.toggle('is-active');"></button>
      </div>
      <div id="errorMsg" class="message-body">
        Please check console and consider submit a bug report on <a href="https://github.com/munsocket//issues">github</a>.
      </div>
    </article>
  </div>
</div>