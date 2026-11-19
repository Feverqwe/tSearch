import LoadingIndicator from './ui/LoadingIndicator';

import logo from '../assets/img/icon_48.png';

import './pageLoading.less';

export default function PageLoading() {
  return (
    <div className="page-loading" role="status">
      <img className="page-loading__logo" src={logo} width={48} height={48} alt="" />
      <div className="page-loading__message">
        <LoadingIndicator />
        {chrome.i18n.getMessage('page_loading')}
      </div>
    </div>
  );
}
