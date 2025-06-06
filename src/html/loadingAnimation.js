export function loadingAnimation() {
  const html = `
  <div id="loaderContainer">
    <div height="800px" width="100%" class="loader"></div>
  </div>
  `;

  const style = `

  #loaderContainer{
  display: flex;
    margin-right: 200px;
    align-itmes: center;
    justify-content:center;
    width: 100%;
  }
.loader {
  width: 28px;
  aspect-ratio: 1;
  border-radius: 50%;
  background: #F10C49;
  animation: l2 1.5s infinite;
}
@keyframes l2 {
  0%,
  100%{transform:translate(-35px);box-shadow:  0     0 #F4DD51, 0     0 #E3AAD6}
  40% {transform:translate( 35px);box-shadow: -15px  0 #F4DD51,-30px  0 #E3AAD6}
  50% {transform:translate( 35px);box-shadow:  0     0 #F4DD51, 0     0 #E3AAD6}
  90% {transform:translate(-35px);box-shadow:  15px  0 #F4DD51, 30px  0 #E3AAD6}
}
  `;

  const wrapper = document.createElement('div');
  wrapper.id = 'loaderWrapper';
  wrapper.innerHTML = html;

  const styleEl = document.createElement('style');
  styleEl.textContent = style;
  wrapper.appendChild(styleEl);

  return wrapper;
}
