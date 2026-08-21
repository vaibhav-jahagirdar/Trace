                         ?column?                         
----------------------------------------------------------
 TABLE: application_bucket_scores                        +
   id uuid NOT NULL                                      +
   resume_analysis_id uuid NOT NULL                      +
   bucket_name text NOT NULL                             +
   score integer                                         +
   rating text NOT NULL                                  +
   confidence text NOT NULL                              +
   summary text                                          +
   supporting_claim_ids ARRAY
 TABLE: application_claims                               +
   id uuid NOT NULL                                      +
   resume_analysis_id uuid NOT NULL                      +
   parent_project_id uuid                                +
   claim_id text NOT NULL                                +
   claim_type text NOT NULL                              +
   claim_text text NOT NULL
 TABLE: application_concepts                             +
   id uuid NOT NULL                                      +
   job_application_id uuid NOT NULL                      +
   created_at timestamp with time zone NOT NULL          +
   concept text NOT NULL
 TABLE: application_eligibility                          +
   id uuid NOT NULL                                      +
   job_application_id uuid NOT NULL                      +
   years_of_professional_experience numeric NOT NULL     +
   highest_education_level character varying(20) NOT NULL+
   notice_period_days integer NOT NULL                   +
   willing_to_relocate_for_this_job boolean NOT NULL     +
   requires_visa_sponsorship boolean NOT NULL            +
   work_authorized boolean NOT NULL                      +
   created_at timestamp with time zone NOT NULL          +
   updated_at timestamp with time zone NOT NULL          +
   current_country character varying(100) NOT NULL       +
   current_state character varying(100)                  +
   current_city character varying(100)
 TABLE: application_projects                             +
   id uuid NOT NULL                                      +
   resume_analysis_id uuid NOT NULL                      +
   claim_id text NOT NULL                                +
   title text NOT NULL                                   +
   description text                                      +
   role text                                             +
   domain text                                           +
   repository_url text                                   +
   relevance_score integer                               +
   quality_score integer                                 +
   overall_score integer                                 +
   rating text                                           +
   priority integer                                      +
   confidence text                                       +
   ignored boolean NOT NULL                              +
   summary text                                          +
   supporting_claim_ids ARRAY
 TABLE: application_repositories                         +
   id uuid NOT NULL                                      +
   application_repository_analysis_id uuid NOT NULL      +
   github_repository_id bigint NOT NULL                  +
   owner character varying(255) NOT NULL                 +
   repository_name character varying(255) NOT NULL       +
   full_name character varying(512) NOT NULL             +
   repository_url text NOT NULL                          +
   classification character varying(20) NOT NULL         +
   default_branch character varying(255) NOT NULL        +
   description text                                      +
   primary_language character varying(100)               +
   languages jsonb NOT NULL                              +
   topics jsonb NOT NULL                                 +
   metadata jsonb NOT NULL                               +
   architecture_tree jsonb NOT NULL                      +
   repository_statistics jsonb NOT NULL                  +
   retrieval_disposition character varying(20)           +
   repository_attention_weight numeric                   +
   priority_rationale text                               +
   created_at timestamp with time zone NOT NULL          +
   updated_at timestamp with time zone NOT NULL          +
   stage_1_relationship character varying(30)            +
   planning_confidence character varying(10)             +
   evidence_priority character varying(10)               +
   linked_stage_1_project_ids jsonb NOT NULL
 TABLE: application_repository_analyses                  +
   id uuid NOT NULL                                      +
   application_task_id uuid NOT NULL                     +
   planner_model character varying(100)                  +
   planner_prompt_version character varying(50)          +
   planner_input_hash character(64)                      +
   planner_output jsonb                                  +
   planning_started_at timestamp with time zone          +
   planning_completed_at timestamp with time zone        +
   created_at timestamp with time zone NOT NULL          +
   updated_at timestamp with time zone NOT NULL          +
   planning_status character varying(20) NOT NULL        +
   planner_raw_output jsonb                              +
   planning_error text
 TABLE: application_repository_evidence_units            +
   id uuid NOT NULL                                      +
   verifier_run_id uuid NOT NULL                         +
   evidence_id text NOT NULL                             +
   repository_id text NOT NULL                           +
   snapshot_ref text NOT NULL                            +
   blob_sha text                                         +
   path text NOT NULL                                    +
   artifact_type text NOT NULL                           +
   start_line integer NOT NULL                           +
   end_line integer NOT NULL                             +
   content text                                          +
   content_hash text NOT NULL                            +
   retrieval_status text NOT NULL                        +
   retrieval_error text                                  +
   created_at timestamp with time zone NOT NULL
 TABLE: application_repository_objectives                +
   id uuid NOT NULL                                      +
   application_repository_id uuid NOT NULL               +
   objective_order smallint NOT NULL                     +
   title text NOT NULL                                   +
   domain text NOT NULL                                  +
   importance text NOT NULL                              +
   verification_goal text NOT NULL                       +
   dependency_policy text NOT NULL                       +
   completion_condition text NOT NULL                    +
   created_at timestamp with time zone NOT NULL          +
   planner_objective_id character varying(100) NOT NULL  +
   source_claim_ids jsonb NOT NULL                       +
   job_requirement_names jsonb NOT NULL                  +
   include_related_configuration boolean NOT NULL
 TABLE: application_repository_paths                     +
   id uuid NOT NULL                                      +
   application_repository_objective_id uuid NOT NULL     +
   repository_path text NOT NULL                         +
   path_type character varying(30) NOT NULL              +
   retrieval_priority numeric NOT NULL                   +
   retrieval_reason text NOT NULL                        +
   follow_dependencies boolean NOT NULL                  +
   created_at timestamp with time zone NOT NULL
 TABLE: application_repository_score_runs                +
   id uuid NOT NULL                                      +
   verifier_run_id uuid NOT NULL                         +
   application_repository_analysis_id uuid NOT NULL      +
   policy_version text NOT NULL                          +
   policy_snapshot jsonb NOT NULL                        +
   scorer_source_revision text NOT NULL                  +
   stage1_score numeric NOT NULL                         +
   repository_evidence_score numeric NOT NULL            +
   repository_coverage_score numeric NOT NULL            +
   repository_adjustment numeric NOT NULL                +
   combined_score numeric NOT NULL                       +
   assessed_requirement_weight numeric NOT NULL          +
   total_requirement_weight numeric NOT NULL             +
   mandatory_complete_negative_count integer NOT NULL    +
   direct_claim_contradiction_count integer NOT NULL     +
   observed_material_risk_count integer NOT NULL         +
   requirement_contributions jsonb NOT NULL              +
   audit_notes jsonb NOT NULL                            +
   scoring_mode text NOT NULL                            +
   created_at timestamp with time zone NOT NULL
 TABLE: application_repository_verifier_runs             +
   id uuid NOT NULL                                      +
   application_repository_analysis_id uuid NOT NULL      +
   attempt integer NOT NULL                              +
   status text NOT NULL                                  +
   verifier_model text                                   +
   verifier_prompt_version text                          +
   raw_llm_response text                                 +
   cleaned_report jsonb                                  +
   retrieval_manifest jsonb                              +
   evidence_snapshot jsonb                               +
   stage1_report_hash text                               +
   stage2a_report_hash text                              +
   repository_snapshot_manifest_hash text                +
   verifier_input_hash text                              +
   verifier_report_hash text                             +
   error_message text                                    +
   started_at timestamp with time zone                   +
   retrieval_completed_at timestamp with time zone       +
   llm_completed_at timestamp with time zone             +
   completed_at timestamp with time zone                 +
   created_at timestamp with time zone NOT NULL          +
   updated_at timestamp with time zone NOT NULL
 TABLE: application_requirement_results                  +
   id uuid NOT NULL                                      +
   resume_analysis_id uuid NOT NULL                      +
   job_requirement_id uuid                               +
   status text NOT NULL                                  +
   note text                                             +
   supporting_claim_ids ARRAY                            +
   requirement_name text                                 +
   requirement_type text                                 +
   tier text
 TABLE: application_resume_analyses                      +
   id uuid NOT NULL                                      +
   job_application_id uuid NOT NULL                      +
   application_task_id uuid NOT NULL                     +
   prompt_version text NOT NULL                          +
   model text NOT NULL                                   +
   extraction_confidence text NOT NULL                   +
   scoring_confidence text NOT NULL                      +
   overall_confidence text NOT NULL                      +
   overall_role_fit text NOT NULL                        +
   repository_priority text NOT NULL                     +
   final_alignment_score numeric NOT NULL                +
   created_at timestamp with time zone NOT NULL          +
   updated_at timestamp with time zone NOT NULL          +
   analysis_version integer NOT NULL                     +
   is_current boolean NOT NULL                           +
   decision_critical_claims ARRAY
 TABLE: application_score_rationale                      +
   id uuid NOT NULL                                      +
   resume_analysis_id uuid NOT NULL                      +
   direction text NOT NULL                               +
   impact text                                           +
   reason text NOT NULL                                  +
   supporting_claim_ids ARRAY
 TABLE: application_submissions                          +
   id uuid NOT NULL                                      +
   job_application_id uuid NOT NULL                      +
   github_url text                                       +
   portfolio_url text                                    +
   linkedin_url text                                     +
   problem_solving_profile_url text                      +
   featured_project_name character varying(255)          +
   featured_project_url text                             +
   project_description text                              +
   feature_description text                              +
   engineering_highlight text                            +
   best_evidence_note text                               +
   why_you_are_a_good_fit text                           +
   created_at timestamp with time zone NOT NULL          +
   updated_at timestamp with time zone NOT NULL          +
   resume_object_key text NOT NULL                       +
   resume_file_name character varying(255) NOT NULL      +
   resume_mime_type character varying(100) NOT NULL      +
   resume_file_size integer NOT NULL                     +
   resume_sha256 character(64) NOT NULL
 TABLE: application_tasks                                +
   id uuid NOT NULL                                      +
   job_application_id uuid NOT NULL                      +
   task_type character varying(50) NOT NULL              +
   status character varying(20) NOT NULL                 +
   attempt_count integer NOT NULL                        +
   max_attempts integer NOT NULL                         +
   started_at timestamp with time zone                   +
   completed_at timestamp with time zone                 +
   next_retry_at timestamp with time zone                +
   last_error_code character varying(100)                +
   last_error_message text                               +
   created_at timestamp with time zone NOT NULL          +
   updated_at timestamp with time zone NOT NULL          +
   human_intervention_required boolean NOT NULL          +
   checkpoint character varying(50)
 TABLE: application_technologies                         +
   id uuid NOT NULL                                      +
   job_application_id uuid NOT NULL                      +
   technology_id uuid                                    +
   created_at timestamp with time zone NOT NULL          +
   raw_value text                                        +
   normalized_key text                                   +
   resolution_status USER-DEFINED NOT NULL               +
   resolution_reason USER-DEFINED
 TABLE: application_verification_targets                 +
   id uuid NOT NULL                                      +
   resume_analysis_id uuid NOT NULL                      +
   claim_id text NOT NULL                                +
   project_claim_id uuid                                 +
   importance text NOT NULL                              +
   claim_type text NOT NULL                              +
   search_hints ARRAY
 TABLE: application_work_experiences                     +
   id uuid NOT NULL                                      +
   resume_analysis_id uuid NOT NULL                      +
   claim_id text NOT NULL                                +
   company text                                          +
   role text                                             +
   start_date text                                       +
   end_date text                                         +
   current boolean                                       +
   domains ARRAY                                         +
   context_flags ARRAY                                   +
   confidence text                                       +
   created_at timestamp with time zone
 TABLE: auth_accounts                                    +
   id uuid NOT NULL                                      +
   user_id uuid NOT NULL                                 +
   provider character varying(50) NOT NULL               +
   provider_user_id character varying(255)               +
   password_hash text                                    +
   password_changed_at timestamp with time zone          +
   failed_login_attempts integer NOT NULL                +
   locked_until timestamp with time zone                 +
   last_login_at timestamp with time zone                +
   created_at timestamp with time zone NOT NULL          +
   updated_at timestamp with time zone NOT NULL
 TABLE: concepts                                         +
   id uuid NOT NULL                                      +
   name USER-DEFINED NOT NULL                            +
   category character varying(100)                       +
   created_at timestamp with time zone NOT NULL
 TABLE: evaluation_dimensions                            +
   id uuid NOT NULL                                      +
   code character varying(100) NOT NULL                  +
   name character varying(255) NOT NULL                  +
   description text                                      +
   created_at timestamp with time zone NOT NULL
 TABLE: evidence_categories                              +
   id uuid NOT NULL                                      +
   code character varying(100) NOT NULL                  +
   name character varying(255) NOT NULL                  +
   description text                                      +
   created_at timestamp with time zone NOT NULL
 TABLE: job_applications                                 +
   id uuid NOT NULL                                      +
   job_id uuid NOT NULL                                  +
   first_name character varying(100) NOT NULL            +
   last_name character varying(100) NOT NULL             +
   email USER-DEFINED NOT NULL                           +
   phone character varying(20)                           +
   status character varying(30) NOT NULL                 +
   applied_at timestamp with time zone NOT NULL          +
   created_at timestamp with time zone NOT NULL          +
   updated_at timestamp with time zone NOT NULL          +
   rejection_source character varying(20)                +
   rejection_reason character varying(100)               +
   rejected_at timestamp with time zone
 TABLE: job_drafts                                       +
   id uuid NOT NULL                                      +
   user_id uuid NOT NULL                                 +
   org_id uuid NOT NULL                                  +
   form_data jsonb NOT NULL                              +
   current_step integer NOT NULL                         +
   status character varying(20) NOT NULL                 +
   job_id uuid                                           +
   created_at timestamp with time zone NOT NULL          +
   updated_at timestamp with time zone NOT NULL
 TABLE: job_eligibility_criteria                         +
   id uuid NOT NULL                                      +
   job_id uuid NOT NULL                                  +
   currency character varying(10) NOT NULL               +
   salary_min numeric NOT NULL                           +
   salary_max numeric NOT NULL                           +
   experience_min_years numeric NOT NULL                 +
   experience_ideal_years numeric NOT NULL               +
   experience_max_years numeric NOT NULL                 +
   notice_period_ideal_days integer NOT NULL             +
   notice_period_max_days integer NOT NULL               +
   relocation_assistance boolean NOT NULL                +
   visa_sponsorship boolean NOT NULL                     +
   work_authorization_required boolean NOT NULL          +
   created_at timestamp with time zone NOT NULL          +
   updated_at timestamp with time zone NOT NULL          +
   minimum_education_level character varying(20) NOT NULL
 TABLE: job_evaluation_priorities                        +
   id uuid NOT NULL                                      +
   job_id uuid NOT NULL                                  +
   evaluation_dimension_id uuid NOT NULL                 +
   weight integer NOT NULL                               +
   created_at timestamp with time zone NOT NULL
 TABLE: job_evidence_priorities                          +
   id uuid NOT NULL                                      +
   job_id uuid NOT NULL                                  +
   evidence_category_id uuid NOT NULL                    +
   weight integer NOT NULL                               +
   created_at timestamp with time zone NOT NULL
 TABLE: job_requirements                                 +
   id uuid NOT NULL                                      +
   job_id uuid NOT NULL                                  +
   technology_id uuid                                    +
   concept_id uuid                                       +
   requirement_type character varying(20) NOT NULL       +
   priority_type character varying(20) NOT NULL          +
   weight numeric NOT NULL                               +
   created_at timestamp with time zone NOT NULL
 TABLE: job_role_categories                              +
   id uuid NOT NULL                                      +
   code character varying(100) NOT NULL                  +
   name character varying(255) NOT NULL                  +
   description text                                      +
   created_at timestamp with time zone NOT NULL
 TABLE: job_submission_requirements                      +
   id uuid NOT NULL                                      +
   job_id uuid NOT NULL                                  +
   resume_required boolean NOT NULL                      +
   github_required boolean NOT NULL                      +
   portfolio_required boolean NOT NULL                   +
   problem_solving_profile_required boolean NOT NULL     +
   linkedin_required boolean NOT NULL                    +
   project_explanation_required boolean NOT NULL         +
   feature_explanation_required boolean NOT NULL         +
   zip_upload_allowed boolean NOT NULL                   +
   created_at timestamp with time zone NOT NULL          +
   updated_at timestamp with time zone NOT NULL
 TABLE: job_success_signals                              +
   id uuid NOT NULL                                      +
   job_id uuid NOT NULL                                  +
   success_signal_id uuid NOT NULL                       +
   weight integer NOT NULL                               +
   created_at timestamp with time zone NOT NULL
 TABLE: jobs                                             +
   id uuid NOT NULL                                      +
   organization_id uuid NOT NULL                         +
   created_by_membership_id uuid NOT NULL                +
   title character varying(255) NOT NULL                 +
   department character varying(150)                     +
   employment_type character varying(30) NOT NULL        +
   work_mode character varying(30) NOT NULL              +
   country character varying(100) NOT NULL               +
   state character varying(100)                          +
   city character varying(100)                           +
   open_positions integer NOT NULL                       +
   description text                                      +
   status character varying(30) NOT NULL                 +
   published_at timestamp with time zone                 +
   closed_at timestamp with time zone                    +
   created_at timestamp with time zone NOT NULL          +
   updated_at timestamp with time zone NOT NULL          +
   deleted_at timestamp with time zone                   +
   role_category_id uuid NOT NULL                        +
   remote_scope character varying(30) NOT NULL
 TABLE: organization_members                             +
   id uuid NOT NULL                                      +
   organization_id uuid NOT NULL                         +
   user_id uuid NOT NULL                                 +
   role character varying(50) NOT NULL                   +
   title character varying(150)                          +
   joined_at timestamp with time zone NOT NULL           +
   invited_by uuid                                       +
   removed_at timestamp with time zone                   +
   created_at timestamp with time zone NOT NULL          +
   updated_at timestamp with time zone NOT NULL
 TABLE: organization_security_actions                    +
   id uuid NOT NULL                                      +
   organization_id uuid NOT NULL                         +
   initiated_by_membership_id uuid NOT NULL              +
   target_membership_id uuid                             +
   action_type character varying(50) NOT NULL            +
   status character varying(30) NOT NULL                 +
   reason text                                           +
   mfa_verified_at timestamp with time zone              +
   scheduled_for timestamp with time zone NOT NULL       +
   expires_at timestamp with time zone NOT NULL          +
   cancelled_at timestamp with time zone                 +
   cancelled_by_membership_id uuid                       +
   executed_at timestamp with time zone                  +
   execution_error text                                  +
   idempotency_key uuid                                  +
   created_at timestamp with time zone NOT NULL          +
   updated_at timestamp with time zone NOT NULL
 TABLE: organizations                                    +
   id uuid NOT NULL                                      +
   slug USER-DEFINED NOT NULL                            +
   name character varying(255) NOT NULL                  +
   description text                                      +
   status character varying(30) NOT NULL                 +
   credits integer NOT NULL                              +
   created_by uuid NOT NULL                              +
   created_at timestamp with time zone NOT NULL          +
   updated_at timestamp with time zone NOT NULL          +
   deleted_at timestamp with time zone
 TABLE: password_reset_tokens                            +
   id uuid NOT NULL                                      +
   user_id uuid NOT NULL                                 +
   token_hash text NOT NULL                              +
   expires_at timestamp with time zone NOT NULL          +
   used_at timestamp with time zone                      +
   requested_ip inet                                     +
   requested_user_agent text                             +
   created_at timestamp with time zone NOT NULL
 TABLE: platform_invites                                 +
   id uuid NOT NULL                                      +
   email USER-DEFINED NOT NULL                           +
   token_hash text NOT NULL                              +
   expires_at timestamp with time zone NOT NULL          +
   accepted_at timestamp with time zone                  +
   revoked_at timestamp with time zone                   +
   created_by uuid                                       +
   revoked_by uuid                                       +
   created_at timestamp with time zone NOT NULL          +
   updated_at timestamp with time zone NOT NULL          +
   accepted_by uuid
 TABLE: repository_shortlist_members                     +
   id uuid NOT NULL                                      +
   shortlist_run_id uuid NOT NULL                        +
   application_id uuid NOT NULL                          +
   score_run_id uuid NOT NULL                            +
   rank integer                                          +
   combined_score numeric NOT NULL                       +
   repository_adjustment numeric NOT NULL                +
   disposition text NOT NULL                             +
   tie_group_id text                                     +
   decision_reason text                                  +
   created_at timestamp with time zone NOT NULL
 TABLE: repository_shortlist_runs                        +
   id uuid NOT NULL                                      +
   job_id uuid NOT NULL                                  +
   policy_version text NOT NULL                          +
   scoring_mode text NOT NULL                            +
   candidate_cohort_type text NOT NULL                   +
   cohort_size integer NOT NULL                          +
   target_count integer NOT NULL                         +
   final_interview_rate numeric NOT NULL                 +
   cutoff_score numeric                                  +
   cutoff_tie_count integer NOT NULL                     +
   created_at timestamp with time zone NOT NULL
 TABLE: resume_analysis_checkpoints                      +
   application_task_id uuid NOT NULL                     +
   stage character varying(50) NOT NULL                  +
   raw_llm_response jsonb NOT NULL                       +
   created_at timestamp with time zone NOT NULL          +
   expires_at timestamp with time zone NOT NULL
 TABLE: resume_analysis_results                          +
   id uuid NOT NULL                                      +
   application_task_id uuid NOT NULL                     +
   request_hash text NOT NULL                            +
   raw_llm_response jsonb NOT NULL                       +
   created_at timestamp with time zone NOT NULL          +
   updated_at timestamp with time zone NOT NULL          +
   cleaned_response jsonb NOT NULL
 TABLE: success_signals                                  +
   id uuid NOT NULL                                      +
   code character varying(100) NOT NULL                  +
   name character varying(255) NOT NULL                  +
   description text                                      +
   created_at timestamp with time zone NOT NULL
 TABLE: technologies                                     +
   id uuid NOT NULL                                      +
   name USER-DEFINED NOT NULL                            +
   category character varying(100)                       +
   created_at timestamp with time zone NOT NULL
 TABLE: user_profiles                                    +
   user_id uuid NOT NULL                                 +
   first_name character varying(100) NOT NULL            +
   last_name character varying(100)                      +
   phone character varying(30)                           +
   avatar_url text                                       +
   linkedin_url text                                     +
   created_at timestamp with time zone NOT NULL          +
   updated_at timestamp with time zone NOT NULL
 TABLE: user_sessions                                    +
   id uuid NOT NULL                                      +
   user_id uuid NOT NULL                                 +
   refresh_token_hash text NOT NULL                      +
   parent_session_id uuid                                +
   user_agent text                                       +
   ip_address inet                                       +
   device_name character varying(255)                    +
   platform character varying(100)                       +
   browser character varying(100)                        +
   expires_at timestamp with time zone NOT NULL          +
   revoked_at timestamp with time zone                   +
   revoked_reason character varying(100)                 +
   last_used_at timestamp with time zone                 +
   created_at timestamp with time zone NOT NULL
 TABLE: users                                            +
   id uuid NOT NULL                                      +
   username USER-DEFINED NOT NULL                        +
   email USER-DEFINED NOT NULL                           +
   status character varying(30) NOT NULL                 +
   email_verified boolean NOT NULL                       +
   email_verified_at timestamp with time zone            +
   suspended_at timestamp with time zone                 +
   suspended_reason text                                 +
   deleted_at timestamp with time zone                   +
   created_at timestamp with time zone NOT NULL          +
   updated_at timestamp with time zone NOT NULL          +
   is_platform_admin boolean NOT NULL
(48 rows)

