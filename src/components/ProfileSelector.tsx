import {RouteLink as Link} from '../ui/navigation';
import {profileRoute} from '../ui/profileRoutes';

interface ProfileSelectorProps {
  profiles: readonly {id: string; name: string}[];
  value: string;
  loading?: boolean;
  unavailable?: boolean;
  onSelect: (id: string) => void;
}

export default function ProfileSelector({
  profiles,
  value,
  loading,
  unavailable,
  onSelect,
}: ProfileSelectorProps) {
  const manage = chrome.i18n.getMessage('manageProfiles');
  const status = unavailable ? 'profiles_load_error' : loading ? 'profiles_loading' : undefined;
  return (
    <div className="parameter parameter-profile">
      <div className="profile_box">
        <select
          className="profile__select ts-control"
          disabled={Boolean(status)}
          aria-label={chrome.i18n.getMessage('profile')}
          value={status ?? value}
          onChange={(event) => onSelect(event.currentTarget.value)}
        >
          {status ? (
            <option value={status} disabled>
              {chrome.i18n.getMessage(status)}
            </option>
          ) : (
            profiles.map(({id, name}) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))
          )}
        </select>
        {!status && (
          <Link
            to={profileRoute(value || undefined)}
            aria-label={manage}
            title={manage}
            className="ts-button ts-button--quiet ts-icon-button ts-icon-link ts-glyph--edit"
          />
        )}
      </div>
    </div>
  );
}
