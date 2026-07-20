import { api } from '@/utils/http/request';

/**
 * Mock - 取得篩選器後續選項
 * GET /api/tag-service/metadata/filter-options
 */

const entityResponse = {
  category: 'profileC',
  label: '最高學歷',
  value: 'highest_education_level',
  component: 'multi_select_dropdown',
  operators: [
    {
      label: '包含',
      value: 'in_list'
    }
  ],
  source: {
    type: 'enum',
    category: '',
    api: '',
    enum: [
      {
        label: '博士',
        value: '1'
      },
      {
        label: '碩士',
        value: '2'
      },
      {
        label: '大學',
        value: '3'
      },
      {
        label: '四技',
        value: '4'
      },
      {
        label: '二技',
        value: '5'
      },
      {
        label: '二專',
        value: '6'
      },
      {
        label: '三專',
        value: '7'
      },
      {
        label: '五專',
        value: '8'
      },
      {
        label: '高中',
        value: '9'
      },
      {
        label: '高職',
        value: '10'
      },
      {
        label: '國中(含以下)',
        value: '11'
      }
    ]
  }
};

const eventResponse = {
  category: 'view_job',
  label: '工作性質',
  value: 'job_nature',
  component: 'multi_select_dropdown',
  operators: [{ label: '包含', value: 'in_list' }],
  source: {
    type: 'enum',
    category: '',
    api: '',
    enum: [
      { label: '全職', value: '1' },
      { label: '兼職', value: '2' },
      { label: '高階', value: '3' }
    ]
  }
};

export const getFilterOptions = params => {
  const isEntityFilter = params.category === 'profileC';

  const data = isEntityFilter ? entityResponse : eventResponse;
  return api.get('/tag-service/metadata/filter-options', {
    params,
    response: { data, metadata: {} }
  });
};
