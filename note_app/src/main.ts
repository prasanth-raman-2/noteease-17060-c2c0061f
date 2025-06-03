import './style.css'
import './NoteEaseMainContainer.css'
import NoteEaseMainContainer from './NoteEaseMainContainer'

// Remove the existing app content and render NoteEase
const mount = document.querySelector<HTMLDivElement>('#app');
if (mount) {
  mount.innerHTML = '';
  // Instantiate the main container
  new NoteEaseMainContainer(mount);
}
