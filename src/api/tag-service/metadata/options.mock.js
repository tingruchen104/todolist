import { api } from '@/utils/http/request';

/**
 * Mock - 取得標籤編輯頁基礎選項
 * GET /api/tag-service/metadata/options
 */
export const getMetadataOptions = () => {
  return api.get('/tag-service/metadata/options', {
    response: {
      data: {
        index: [
          {
            label: '無（null）',
            value: 'null'
          },
          {
            label: '找工作頁（JobOn）',
            value: 'jobOn'
          },
          {
            label: '找公司頁（CustProfile）',
            value: 'custProfile'
          }
        ],
        products: [
          '1',
          '45plus',
          'HA',
          'aiJobBot',
          'association',
          'boost',
          'c',
          'college',
          'daisytest',
          'daisytest1',
          'deboost',
          'digital_homepage',
          'digital_talent',
          'ems',
          'erbrand',
          'foreigners',
          'giver',
          'indexjob',
          'industry',
          'karena_test',
          'looking_jobs',
          'nabi',
          'ncc',
          'senior',
          'student',
          'test',
          'user_feature_360',
          'user_profile_360_AC',
          'user_profile_360_career',
          'user_profile_360_enabled',
          'user_profile_360_intention',
          'user_profile_360_looking_jobs',
          'user_profile_360_resume',
          'user_profile_360_resume_update'
        ],
        sites: [
          {
            label: '職缺（jobno）',
            value: 'job'
          },
          {
            label: '人（idno）',
            value: 'resume'
          },
          {
            label: '人（pid）',
            value: 'resume_p'
          },
          {
            label: '公司（custno）',
            value: 'custprofile'
          },
          {
            label: '公司（invoice）',
            value: 'custprofile_inv'
          }
        ],
        groups: [
          {
            label: 'V-Hub（v_hub）串接尚未完成',
            value: 'v_hub'
          }
        ],
        filter: {
          entity: [
            {
              label: 'C會員資料',
              value: 'profileC',
              children: [
                {
                  label: '性別',
                  value: 'gender',
                  description: 'AC性別欄位'
                },
                {
                  label: '生日',
                  value: 'date_of_birth',
                  description: 'AC生日欄位'
                },
                {
                  label: '通訊地址(地區)',
                  value: 'contact_address_region',
                  description: 'AC通訊地址欄位中的城市及行政區，如：台北市大安區'
                },
                {
                  label: '最高學歷',
                  value: 'highest_education_level',
                  description: '主要履歷表中的最高學歷的「學歷」欄位，如：博士、碩士'
                },
                {
                  label: '最高學歷狀態',
                  value: 'highest_education_status',
                  description: '主要履歷表中的最高學歷就學狀態'
                },
                {
                  label: '最高學歷就學期間(起始日)',
                  value: 'highest_education_start_date',
                  description: '主要履歷表「最高學歷」的就學期間起始日：yyyymm'
                },
                {
                  label: '最高學歷就學期間(結束日)',
                  value: 'highest_education_end_date',
                  description: '主要履歷表「最高學歷」的就學期間結束日：yyyymm'
                },
                {
                  label: '特殊身份',
                  value: 'special_identities',
                  description: '主要履歷表中「個人資料」的特殊身份，如：外籍人士、新住民等'
                },
                {
                  label: '是否仍在職',
                  value: 'is_currently_employed',
                  description: '主要履歷表中的「仍在職」選項：是、否'
                },
                {
                  label: '履歷開放設定',
                  value: 'resume_visibility_setting',
                  description: '主要履歷表開放設定：開放中、關閉中'
                },
                {
                  label: 'MY104 啟用',
                  value: 'my104_enabled',
                  description: ''
                },
                {
                  label: '總年資',
                  value: 'total_work_experience',
                  description: '主要履歷表「總年資」，如：無工作經驗、1~2 年等'
                },
                {
                  label: '最近一份工作的工作技能',
                  value: 'latest_work_skills',
                  description: '主要履歷表「最近一份工作經歷」的「工作技能」'
                },
                {
                  label: '所有工作的工作技能',
                  value: 'all_work_skills',
                  description: '主要履歷表「所有工作經歷」的「工作技能」'
                },
                {
                  label: '希望職稱',
                  value: 'desired_job_title',
                  description: '主要履歷表「求職條件」的「希望職稱」'
                },
                {
                  label: '希望職類',
                  value: 'desired_job_category',
                  description: '主要履歷表「求職條件」的「希望職類」'
                },
                {
                  label: '最近一份工作的工作描述',
                  value: 'latest_job_description_keyword',
                  description: '主要履歷表「最近一份工作經歷」的「工作描述」'
                },
                {
                  label: '所有工作的工作描述',
                  value: 'all_job_description_keyword',
                  description: '主要履歷表「所有工作經歷」的「工作描述」'
                },
                {
                  label: '是否申請過履歷健診',
                  value: 'applied_resume_checkup',
                  description: ''
                },
                {
                  label: '希望地點',
                  value: 'desired_locations',
                  description: '主要履歷表「求職條件」的「希望地點」'
                },
                {
                  label: '最高學歷就讀學校',
                  value: 'highest_attended_school',
                  description: '主要履歷表「最高學歷」的「學校」'
                },
                {
                  label: '所有學歷就讀學校',
                  value: 'all_attended_schools',
                  description: '主要履歷表「所有學歷」曾就讀過的「學校」'
                },
                {
                  label: '最近一份薪資(月薪)',
                  value: 'latest_monthly_salary',
                  description: '主要履歷表「工作經歷」的「薪資待遇」的「月薪」'
                },
                {
                  label: '最近一份薪資(年薪)',
                  value: 'latest_annual_salary',
                  description: '主要履歷表「工作經歷」的「薪資待遇」的「年薪」'
                },
                {
                  label: '是否為職場力會員',
                  value: 'is_workforce_member',
                  description: ''
                },
                {
                  label: '最近一份工作的職務名稱',
                  value: 'latest_job_title',
                  description: '主要履歷表的最近一份工作職務名稱'
                },
                {
                  label: '最近一份工作的職務類別',
                  value: 'latest_job_category',
                  description: '主要履歷表的最近一份工作職務類別'
                },
                {
                  label: '最近一份工作是否為主管職',
                  value: 'latest_job_is_manager',
                  description: '主要履歷表的最近一份工作是否為主管職'
                }
              ]
            }
          ],
          event: {
            events: [
              {
                label: '主網事件',
                value: 'main_website',
                children: [
                  {
                    label: '瀏覽公司',
                    value: 'view_company',
                    description: 'C用戶於主網瀏覽公司頁面',
                    children: [
                      { label: '產業', value: 'industry' },
                      { label: 'custno', value: 'cutno' },
                      { label: '是否為上市櫃公司', value: 'is_publicly_traded' }
                    ]
                  },
                  {
                    label: '瀏覽職缺',
                    value: 'view_job',
                    description: 'C用戶於主網瀏覽職缺頁面',
                    children: [
                      { label: '產業', value: 'industry' },
                      { label: '職缺類型', value: 'job_type' },
                      { label: '職缺名稱', value: 'job_title' },
                      { label: '職缺性質', value: 'job_nature' }
                    ]
                  }
                ]
              }
            ],
            timeRanges: [
              { label: '昨天', value: 'yesterday' },
              { label: '近 7 天內', value: 'last_7_days' },
              { label: '近 30 天內', value: 'last_30_days' },
              { label: '近 60 天內', value: 'last_60_days' },
              { label: '近 90 天內', value: 'last_90_days' },
              { label: '近 180 天內', value: 'last_180_days' }
            ],
            occurred: [
              { label: '發生', value: 'true' },
              { label: '未發生', value: 'false' }
            ],
            countMetrics: [{ label: '總次數', value: 'total' }],
            countOperators: [
              { label: '等於', value: 'equals' },
              { label: '不等於', value: 'not_equals' },
              { label: '大於等於', value: 'greater_than' },
              { label: '小於等於', value: 'less_than' }
            ]
          }
        }
      },
      metadata: {}
    }
  });
};
