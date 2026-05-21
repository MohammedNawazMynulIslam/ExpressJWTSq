export interface IIssue {
  id?: number;
  title: string;
  description: string;
  type: "bug" | "feature_request";
  status?: "open" | "in_progress" | "resolved";
  reporter_id?: number;
  created_at?: Date;
  updated_at?: Date;

  name?: string;
  email?: string;
  password?: string;
  role?: "contributor" | "maintainer";
}


// issue.interface.ts
export interface IIssueQuery {
  sort?: "newest" | "oldest" | undefined;
  type?: "bug" | "feature_request" | undefined;
  status?: "open" | "in_progress" | "resolved" | undefined;
} 
export interface IssueRequester {
  id: number;
  role: string;
};