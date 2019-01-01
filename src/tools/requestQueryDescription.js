import exKitGetDoc from "./exKitGetDoc";
import {ErrorWithCode} from "./errors";
import closestElement from "./closestElement";

const qs = require('querystring');

const requestQueryDescription = (query) => {
  return fetch('https://www.google.com/search?' + qs.stringify({
    q: query
  })).then((response) => {
    return response.text().then((body) => {
      const doc = exKitGetDoc(body, response.url);

      const content = doc.querySelector('#rhs_block');
      if (!content) {
        throw new ErrorWithCode('Container is not found', 'NOT_FOUND');
      }

      const images = Array.from(content.querySelectorAll('a img')).reduce((result, node) => {
        const link = closestElement(node, 'a');
        if (link.href) {
          const uri = new URL(link.href);
          const query = qs.parse(uri.search.substr(1));
          const imgUrl = query.imgurl;
          if (/^https?:/.test(imgUrl)) {
            result.push(imgUrl);
          }
        }
        return result;
      }, []);

      const proxyImages = images.map((url) => {
        return 'https://images-pos-opensocial.googleusercontent.com/gadgets/proxy?container=pos&resize_w=400&rewriteMime=image/jpeg&url=' + encodeURIComponent(url);
      });

      const allImages = proxyImages.concat(images);

      const titleNode = content.querySelector('div.kno-ecr-pt');
      const title = titleNode && titleNode.textContent || '';
      if (!title) {
        throw new Error('Title is empty');
      }

      const typeNode = titleNode.nextElementSibling || content.querySelector('div.kno-ecr-st');
      const type = typeNode && typeNode.textContent || '';

      let wikiUrl = null;
      let wikiUrlText = null;
      let description = null;
      const descriptionNode = content.querySelector('div.kno-rdesc');
      if (descriptionNode) {
        const descriptionTextNode = descriptionNode.querySelector('h3 ~ span');
        if (descriptionTextNode) {
          const moreBtn = descriptionTextNode.querySelector('span[data-t="kno-desc-sh"]');
          if (moreBtn) {
            moreBtn.parentNode.removeChild(moreBtn);
          }
          description = descriptionTextNode.textContent;
        }

        const wikiLink = Array.from(descriptionNode.querySelectorAll('a')).pop();
        if (wikiLink) {
          if (wikiLink.dataset.href) {
            wikiLink.href = wikiLink.dataset.href;
          }
          const url = wikiLink.href;
          if (url) {
            wikiUrl = url;
            wikiUrlText = wikiLink.textContent;
          }
        }
      }
      if (description === null) {
        throw new Error('Description not found');
      }

      const list = [];
      Array.from(content.querySelectorAll('div.kno-fb-ctx > .kno-fv')).forEach((node) => {
        let keyElement = node.previousElementSibling;
        if (!keyElement) return;
        const key = keyElement.textContent.trim();

        const lastEl = node.lastElementChild;
        if (lastEl && lastEl.tagName === 'A' && lastEl.firstChild.nodeType === 1) {
          let lPP, lP;
          if ((lP = lastEl.previousElementSibling) && lP.textContent === ' ' &&
            (lPP = lP.previousElementSibling) && lPP.textContent === ',') {
            node.removeChild(lastEl);
            node.removeChild(lPP);
            node.removeChild(lP);
          }
        }

        const value = node.textContent.trim();
        if (value) {
          list.push({key, value});
        }
      });

      return {
        title,
        type,
        description,
        wikiUrl,
        wikiUrlText,
        images: allImages,
        list
      };
    });
  });
};

export default requestQueryDescription;