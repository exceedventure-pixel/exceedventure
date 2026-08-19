import * as migration_20260702_121508_initial from './20260702_121508_initial'
import * as migration_20260809_154317_crm_collections from './20260809_154317_crm_collections'
import * as migration_20260811_120000_crm_feature_parity from './20260811_120000_crm_feature_parity'
import * as migration_20260811_170000_rename_worker_to_member from './20260811_170000_rename_worker_to_member'
import * as migration_20260811_180000_task_depth from './20260811_180000_task_depth'
import * as migration_20260811_190000_record_codes from './20260811_190000_record_codes'
import * as migration_20260811_200000_site_settings from './20260811_200000_site_settings'
import * as migration_20260812_100000_enquiries from './20260812_100000_enquiries'
import * as migration_20260812_120000_user_roles from './20260812_120000_user_roles'
import * as migration_20260818_100000_website_showcase from './20260818_100000_website_showcase'
import * as migration_20260819_120000_showcase_uniform_grid from './20260819_120000_showcase_uniform_grid'

export const migrations = [
  {
    up: migration_20260702_121508_initial.up,
    down: migration_20260702_121508_initial.down,
    name: '20260702_121508_initial',
  },
  {
    up: migration_20260809_154317_crm_collections.up,
    down: migration_20260809_154317_crm_collections.down,
    name: '20260809_154317_crm_collections',
  },
  {
    up: migration_20260811_120000_crm_feature_parity.up,
    down: migration_20260811_120000_crm_feature_parity.down,
    name: '20260811_120000_crm_feature_parity',
  },
  {
    up: migration_20260811_170000_rename_worker_to_member.up,
    down: migration_20260811_170000_rename_worker_to_member.down,
    name: '20260811_170000_rename_worker_to_member',
  },
  {
    up: migration_20260811_180000_task_depth.up,
    down: migration_20260811_180000_task_depth.down,
    name: '20260811_180000_task_depth',
  },
  {
    up: migration_20260811_190000_record_codes.up,
    down: migration_20260811_190000_record_codes.down,
    name: '20260811_190000_record_codes',
  },
  {
    up: migration_20260811_200000_site_settings.up,
    down: migration_20260811_200000_site_settings.down,
    name: '20260811_200000_site_settings',
  },
  {
    up: migration_20260812_100000_enquiries.up,
    down: migration_20260812_100000_enquiries.down,
    name: '20260812_100000_enquiries',
  },
  {
    up: migration_20260812_120000_user_roles.up,
    down: migration_20260812_120000_user_roles.down,
    name: '20260812_120000_user_roles',
  },
  {
    up: migration_20260818_100000_website_showcase.up,
    down: migration_20260818_100000_website_showcase.down,
    name: '20260818_100000_website_showcase',
  },
  {
    up: migration_20260819_120000_showcase_uniform_grid.up,
    down: migration_20260819_120000_showcase_uniform_grid.down,
    name: '20260819_120000_showcase_uniform_grid',
  },
]
