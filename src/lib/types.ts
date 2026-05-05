export type VacancyRow = {
  ministry: string;
  department: string;
  priorityVacantPosts: string;
  postNumber: string;
  salaryScale: string;
  annualSalary: number;
  recruitmentStatus: string;
};

export type PageId = 'executive' | 'ministry' | 'recruitment';
