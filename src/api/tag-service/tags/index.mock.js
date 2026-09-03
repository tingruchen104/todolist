import { api } from '@/utils/http/request';

/**
 * Mock - 取得單一標籤設定（編輯/複製使用），初始表單資料
 * GET /api/tag-service/tags/{tag}
 */
export const getTagConfig = tagId => {
  return api.get(`/tag-service/tags/${tagId}`, {
    response: {
      data: {
        scheduleTypeDesc: '日更',
        product: 'karena_test',
        site: 'resume',
        tag: 'chloe_test_filter_entity',
        tagName: 'Chloe測試用_entity',
        owner: 'chloe.guo@104.com.tw',
        status: 0,
        schedule: {
          type: 'daily'
        },
        scheduleActive: 0,
        daysToExpiry: null,
        expireDate: null,
        statusTime: '20260319',
        createdAt: '20251201',
        total: 0,
        index: 'null',
        description: '',
        query:
          "WITH entity_profileC_0_1 AS (  SELECT idno  FROM silver_dtpf_tag.dim_profile_c  WHERE latest_annual_salary BETWEEN 1111 AND 2222  AND latest_monthly_salary BETWEEN 10000 AND 50000  AND date_of_birth BETWEEN TO_DATE('20251201', 'yyyyMMdd') AND TO_DATE('20251208', 'yyyyMMdd')  AND (SUBSTRING(CAST(contact_address_region AS STRING), 1, 7) = '6001003' OR SUBSTRING(CAST(contact_address_region AS STRING), 1, 7) = '6001002')  AND highest_education_level IN ('2', '3')  AND highest_education_status != '2'  AND highest_education_start_date <= TIMESTAMP('2025-10-01 00:00:00')  AND highest_education_end_date BETWEEN TIMESTAMP('2025-08-01 00:00:00') AND TIMESTAMP(CONCAT('2025-11-', DAY(LAST_DAY(TO_DATE('20251101', 'yyyyMMdd'))), ' 23:59:59'))  AND (array_contains(special_identities, '1'))  AND is_currently_employed = '1' ), entity_profileC_1_2 AS (  SELECT idno FROM entity_profileC_0_1 prev  WHERE EXISTS (  SELECT 1 FROM silver_dtpf_tag.dim_profile_c p  WHERE p.idno = prev.idno  AND (resume_visibility_setting = '1'  AND my104_enabled = '0'  AND total_work_experience IN ('99', '0', '2', '1')  AND (latest_work_skills IS NULL OR size(latest_work_skills) = 0)  AND NOT exists(all_work_skills, x -> x LIKE '%不會%')  AND (desired_job_title IS NOT NULL AND desired_job_title != '')  AND (latest_job_description_keyword IS NULL OR latest_job_description_keyword = '')  AND exists(all_job_description_keyword, x -> x LIKE '%會%')  AND applied_resume_checkup = '0'  AND (exists(desired_locations, x -> SUBSTRING(x, 1, 7) = '6001001') OR exists(desired_locations, x -> SUBSTRING(x, 1, 7) = '6001002') OR exists(desired_locations, x -> SUBSTRING(x, 1, 7) = '6001003') OR exists(desired_locations, x -> SUBSTRING(x, 1, 7) = '6001004') OR exists(desired_locations, x -> SUBSTRING(x, 1, 7) = '6001005') OR exists(desired_locations, x -> SUBSTRING(x, 1, 7) = '6001006') OR exists(desired_locations, x -> SUBSTRING(x, 1, 7) = '6001007') OR exists(desired_locations, x -> SUBSTRING(x, 1, 7) = '6001008') OR exists(desired_locations, x -> SUBSTRING(x, 1, 7) = '6001010') OR exists(desired_locations, x -> SUBSTRING(x, 1, 7) = '6001011')))  ) ), entity_profileC_2_3 AS (  SELECT idno FROM entity_profileC_1_2 prev  WHERE EXISTS (  SELECT 1 FROM silver_dtpf_tag.dim_profile_c p  WHERE p.idno = prev.idno  AND (latest_monthly_salary <= 100000  AND latest_annual_salary >= 20000  AND is_workforce_member = '0'  AND (latest_job_title IS NULL OR latest_job_title = '')  AND (SUBSTRING(CAST(latest_job_category AS STRING), 1, 7) = '2001001' OR SUBSTRING(CAST(latest_job_category AS STRING), 1, 7) = '2001002')  AND latest_job_is_manager = '1')  ) ) SELECT DISTINCT idno FROM entity_profileC_2_3",
        fileId: null,
        groups: ['v_hub'],
        condition: {
          operator: 'and',
          modules: [
            {
              module: 'event',
              operator: 'and',
              conditions: [
                {
                  operator: 'and',
                  conditions: [
                    {
                      timeRange: 'last_7_days',
                      occurred: 'true',
                      category: 'view_job',
                      parameter: {
                        operator: 'or',
                        conditions: [
                          { field: 'job_nature', operator: 'in_list', values: ['1', '2'] }
                        ]
                      },
                      count: { metric: 'total', operator: 'greater_than', value: '1' }
                    }
                  ]
                }
              ]
            },
            {
              module: 'entity',
              operator: 'and',
              conditions: [
                {
                  operator: 'and',
                  conditions: [
                    {
                      category: 'profileC',
                      field: 'highest_education_level',
                      operator: 'in_list',
                      values: ['2', '3']
                    }
                  ]
                }
              ]
            }
          ]
        },
        referencedTags: null
      },
      metadata: {}
    }
  });
};

/**
 * Mock - 新增單一標籤設定（新增/複製使用）
 * POST /api/tag-service/tags
 */
export const createTag = data => {
  return api.post('/tag-service/tags', {
    data,
    response: {
      status: 400,
      data: {
        error: {
          code: 10101,
          message: '標籤名稱 (tag) 命名重複，請重新命名',
          details: {}
        }
      }
    }
  });
};

/**
 * Mock - 更新單一標籤設定
 * POST /api/tag-service/tags/{tag}
 */
export const updateTag = (tagId, data) => {
  return api.post(`/tag-service/tags/${tagId}`, {
    data,
    response: {
      data: {
        tag: 'updated_tag', // 標籤英文名稱
        tagName: '更新標籤' // 標籤中文名稱
      },
      metadata: {}
    }
  });
};
