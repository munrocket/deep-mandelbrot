<header>
  <nav class="navbar is-black" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <h1 class="navbar-item has-text-weight-bold">DeepMandelbrot</h1>
      <a role="button" class="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="menu">
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>
    <div id="menu" class="navbar-menu">
      <div class="navbar-start">
        <div class="navbar-item has-dropdown is-hoverable">
          <a class="navbar-link">Color</a>
          <div class="navbar-dropdown">
            <a class="navbar-item" onclick="colorScheme = 0; draw(aim);">Smooth iteration</a>
            <a class="navbar-item" onclick="colorScheme = 1; exteriortex = dogetex; draw(aim);">Doge tessellation</a>
            <a class="navbar-item" onclick="colorScheme = 1; exteriortex = lolitex; draw(aim);">Loli tessellation</a>
            <a class="navbar-item" onclick="colorScheme = 1; exteriortex = ricktex; draw(aim);">Rick tessellation</a>
          </div>
        </div>
        <div class="navbar-item">
          <label class="checkbox supersamling-check">
            <input type="checkbox" onclick="superSampling = superSampling == 0 ? 1 : 0; draw(aim);">
            Supersamling
          </label>
        </div>
        <!-- <a class="navbar-item" onclick="Events.savePng();">Save</a> -->
      </div>
      <div class="navbar-end">
        <div class="navbar-item">
          <div class="buttons">
            <a class="button patreon-button" rel="noopener" href="https://www.patreon.com/deepfractal" target="_blank">
              <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
                <path fill="#ffffff" d="M108.8135992 26.06720125c-26.468266 0-48.00213212 21.53066613-48.00213212 47.99733213
                  0 26.38653268 21.53386613 47.85426547 48.00213213 47.85426547 26.38639937 0 47.8530655-21.4677328
                  47.8530655-47.85426547 0-26.466666-21.46666613-47.99733213-47.85306547-47.99733213" />
                <path fill="#ffffff" d="M23.333335 153.93333178V26.0666679h23.46666576v127.8666639z" />
              </svg>
              <span>Become a Patron</span>
            </a>
            <a class="button is-primary" rel="noopener" href="https://github.com/munrocket/deep-fractal" target="_blank">
              <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 20 20">
                <path fill="#ffffff" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
                  0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01
                  1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95
                  0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04
                  2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01
                  1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path>
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </nav>
</header>

<style>
  #menu.is-active {
    position: fixed;
    width: 100%;
    top: 3.25em;
  }
  
  .patreon-button {
    background-color: rgb(250, 116, 94);
    border-color: rgb(250, 116, 94);
    color: #ffffff;
  }
  
  .patreon-button:hover {
    background-color: rgb(238, 109, 89);
    border-color: rgb(238, 109, 89);
    color: #ffffff;
  }
  
  .supersamling-check:hover {
    color: #3273dc;
  }

  @media screen and (min-width: 1088px) {
    #menu.is-active {
      position: static;
      width: auto;
    }
    #zoomOut {
      display: none;
    }
    .supersamling-check:hover {
      color: #ffffff;
    }
  }
</style>