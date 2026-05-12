-- ═══════════════════════════════════════════════════════════════════════════════
-- BLOCO 6 — INDEXES (293 índices)
-- ═══════════════════════════════════════════════════════════════════════════════
-- Idempotente: DROP IF EXISTS + CREATE INDEX para cada índice do schema public
-- Ordem: por tabela, depois por nome do índice
-- Inclui: UNIQUE, PRIMARY KEY (implícitos), GIN, btree, DESC, composite
-- ═══════════════════════════════════════════════════════════════════════════════
-- PRÉ-REQUISITO: BLOCO 1 (tabelas) deve estar aplicado antes deste bloco.
-- ═══════════════════════════════════════════════════════════════════════════════

DROP INDEX IF EXISTS public.agent_achievements_pkey CASCADE;
CREATE UNIQUE INDEX agent_achievements_pkey ON public.agent_achievements USING btree (id);

DROP INDEX IF EXISTS public.idx_agent_achievements_profile CASCADE;
CREATE INDEX idx_agent_achievements_profile ON public.agent_achievements USING btree (profile_id);

DROP INDEX IF EXISTS public.agent_skills_pkey CASCADE;
CREATE UNIQUE INDEX agent_skills_pkey ON public.agent_skills USING btree (id);

DROP INDEX IF EXISTS public.agent_skills_profile_id_skill_name_key CASCADE;
CREATE UNIQUE INDEX agent_skills_profile_id_skill_name_key ON public.agent_skills USING btree (profile_id, skill_name);

DROP INDEX IF EXISTS public.agent_stats_pkey CASCADE;
CREATE UNIQUE INDEX agent_stats_pkey ON public.agent_stats USING btree (id);

DROP INDEX IF EXISTS public.agent_stats_profile_id_key CASCADE;
CREATE UNIQUE INDEX agent_stats_profile_id_key ON public.agent_stats USING btree (profile_id);

DROP INDEX IF EXISTS public.idx_agent_stats_level CASCADE;
CREATE INDEX idx_agent_stats_level ON public.agent_stats USING btree (level DESC);

DROP INDEX IF EXISTS public.idx_agent_stats_xp CASCADE;
CREATE INDEX idx_agent_stats_xp ON public.agent_stats USING btree (xp DESC);

DROP INDEX IF EXISTS public.agent_visibility_grants_agent_id_can_see_agent_id_key CASCADE;
CREATE UNIQUE INDEX agent_visibility_grants_agent_id_can_see_agent_id_key ON public.agent_visibility_grants USING btree (agent_id, can_see_agent_id);

DROP INDEX IF EXISTS public.agent_visibility_grants_pkey CASCADE;
CREATE UNIQUE INDEX agent_visibility_grants_pkey ON public.agent_visibility_grants USING btree (id);

DROP INDEX IF EXISTS public.ai_conversation_tags_pkey CASCADE;
CREATE UNIQUE INDEX ai_conversation_tags_pkey ON public.ai_conversation_tags USING btree (id);

DROP INDEX IF EXISTS public.ai_providers_pkey CASCADE;
CREATE UNIQUE INDEX ai_providers_pkey ON public.ai_providers USING btree (id);

DROP INDEX IF EXISTS public.ai_usage_logs_pkey CASCADE;
CREATE UNIQUE INDEX ai_usage_logs_pkey ON public.ai_usage_logs USING btree (id);

DROP INDEX IF EXISTS public.idx_ai_usage_logs_created_at CASCADE;
CREATE INDEX idx_ai_usage_logs_created_at ON public.ai_usage_logs USING btree (created_at DESC);

DROP INDEX IF EXISTS public.idx_ai_usage_logs_function_name CASCADE;
CREATE INDEX idx_ai_usage_logs_function_name ON public.ai_usage_logs USING btree (function_name);

DROP INDEX IF EXISTS public.idx_ai_usage_logs_profile_id CASCADE;
CREATE INDEX idx_ai_usage_logs_profile_id ON public.ai_usage_logs USING btree (profile_id);

DROP INDEX IF EXISTS public.idx_ai_usage_logs_status CASCADE;
CREATE INDEX idx_ai_usage_logs_status ON public.ai_usage_logs USING btree (status);

DROP INDEX IF EXISTS public.idx_ai_usage_logs_user_id CASCADE;
CREATE INDEX idx_ai_usage_logs_user_id ON public.ai_usage_logs USING btree (user_id);

DROP INDEX IF EXISTS public.allowed_countries_country_code_key CASCADE;
CREATE UNIQUE INDEX allowed_countries_country_code_key ON public.allowed_countries USING btree (country_code);

DROP INDEX IF EXISTS public.allowed_countries_pkey CASCADE;
CREATE UNIQUE INDEX allowed_countries_pkey ON public.allowed_countries USING btree (id);

DROP INDEX IF EXISTS public.idx_allowed_countries_code CASCADE;
CREATE INDEX idx_allowed_countries_code ON public.allowed_countries USING btree (country_code);

DROP INDEX IF EXISTS public.audio_memes_pkey CASCADE;
CREATE UNIQUE INDEX audio_memes_pkey ON public.audio_memes USING btree (id);

DROP INDEX IF EXISTS public.audit_logs_pkey CASCADE;
CREATE UNIQUE INDEX audit_logs_pkey ON public.audit_logs USING btree (id);

DROP INDEX IF EXISTS public.idx_audit_logs_action CASCADE;
CREATE INDEX idx_audit_logs_action ON public.audit_logs USING btree (action);

DROP INDEX IF EXISTS public.idx_audit_logs_created_at CASCADE;
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at DESC);

DROP INDEX IF EXISTS public.idx_audit_logs_user_created CASCADE;
CREATE INDEX idx_audit_logs_user_created ON public.audit_logs USING btree (user_id, created_at DESC);

DROP INDEX IF EXISTS public.idx_audit_logs_user_id CASCADE;
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs USING btree (user_id);

DROP INDEX IF EXISTS public.auto_close_config_pkey CASCADE;
CREATE UNIQUE INDEX auto_close_config_pkey ON public.auto_close_config USING btree (id);

DROP INDEX IF EXISTS public.automations_pkey CASCADE;
CREATE UNIQUE INDEX automations_pkey ON public.automations USING btree (id);

DROP INDEX IF EXISTS public.away_messages_pkey CASCADE;
CREATE UNIQUE INDEX away_messages_pkey ON public.away_messages USING btree (id);

DROP INDEX IF EXISTS public.away_messages_whatsapp_connection_id_key CASCADE;
CREATE UNIQUE INDEX away_messages_whatsapp_connection_id_key ON public.away_messages USING btree (whatsapp_connection_id);

DROP INDEX IF EXISTS public.blocked_countries_country_code_key CASCADE;
CREATE UNIQUE INDEX blocked_countries_country_code_key ON public.blocked_countries USING btree (country_code);

DROP INDEX IF EXISTS public.blocked_countries_pkey CASCADE;
CREATE UNIQUE INDEX blocked_countries_pkey ON public.blocked_countries USING btree (id);

DROP INDEX IF EXISTS public.idx_blocked_countries_code CASCADE;
CREATE INDEX idx_blocked_countries_code ON public.blocked_countries USING btree (country_code);

DROP INDEX IF EXISTS public.blocked_ips_ip_address_key CASCADE;
CREATE UNIQUE INDEX blocked_ips_ip_address_key ON public.blocked_ips USING btree (ip_address);

DROP INDEX IF EXISTS public.blocked_ips_pkey CASCADE;
CREATE UNIQUE INDEX blocked_ips_pkey ON public.blocked_ips USING btree (id);

DROP INDEX IF EXISTS public.idx_blocked_ips_expires CASCADE;
CREATE INDEX idx_blocked_ips_expires ON public.blocked_ips USING btree (expires_at);

DROP INDEX IF EXISTS public.idx_blocked_ips_ip CASCADE;
CREATE INDEX idx_blocked_ips_ip ON public.blocked_ips USING btree (ip_address);

DROP INDEX IF EXISTS public.business_hours_pkey CASCADE;
CREATE UNIQUE INDEX business_hours_pkey ON public.business_hours USING btree (id);

DROP INDEX IF EXISTS public.business_hours_whatsapp_connection_id_day_of_week_key CASCADE;
CREATE UNIQUE INDEX business_hours_whatsapp_connection_id_day_of_week_key ON public.business_hours USING btree (whatsapp_connection_id, day_of_week);

DROP INDEX IF EXISTS public.idx_business_hours_connection CASCADE;
CREATE INDEX idx_business_hours_connection ON public.business_hours USING btree (whatsapp_connection_id);

DROP INDEX IF EXISTS public.calls_pkey CASCADE;
CREATE UNIQUE INDEX calls_pkey ON public.calls USING btree (id);

DROP INDEX IF EXISTS public.campaign_ab_variants_pkey CASCADE;
CREATE UNIQUE INDEX campaign_ab_variants_pkey ON public.campaign_ab_variants USING btree (id);

DROP INDEX IF EXISTS public.campaign_contacts_pkey CASCADE;
CREATE UNIQUE INDEX campaign_contacts_pkey ON public.campaign_contacts USING btree (id);

DROP INDEX IF EXISTS public.idx_campaign_contacts_campaign CASCADE;
CREATE INDEX idx_campaign_contacts_campaign ON public.campaign_contacts USING btree (campaign_id, status);

DROP INDEX IF EXISTS public.idx_campaign_contacts_campaign_id CASCADE;
CREATE INDEX idx_campaign_contacts_campaign_id ON public.campaign_contacts USING btree (campaign_id);

DROP INDEX IF EXISTS public.idx_campaign_contacts_status CASCADE;
CREATE INDEX idx_campaign_contacts_status ON public.campaign_contacts USING btree (status);

DROP INDEX IF EXISTS public.campaigns_pkey CASCADE;
CREATE UNIQUE INDEX campaigns_pkey ON public.campaigns USING btree (id);

DROP INDEX IF EXISTS public.idx_campaigns_created_by CASCADE;
CREATE INDEX idx_campaigns_created_by ON public.campaigns USING btree (created_by);

DROP INDEX IF EXISTS public.canned_responses_pkey CASCADE;
CREATE UNIQUE INDEX canned_responses_pkey ON public.canned_responses USING btree (id);

DROP INDEX IF EXISTS public.idx_canned_responses_category CASCADE;
CREATE INDEX idx_canned_responses_category ON public.canned_responses USING btree (category);

DROP INDEX IF EXISTS public.idx_canned_responses_created_by CASCADE;
CREATE INDEX idx_canned_responses_created_by ON public.canned_responses USING btree (created_by);

DROP INDEX IF EXISTS public.channel_connections_pkey CASCADE;
CREATE UNIQUE INDEX channel_connections_pkey ON public.channel_connections USING btree (id);

DROP INDEX IF EXISTS public.channel_connections_user_id_channel_type_key CASCADE;
CREATE UNIQUE INDEX channel_connections_user_id_channel_type_key ON public.channel_connections USING btree (user_id, channel_type);

DROP INDEX IF EXISTS public.chatbot_flows_pkey CASCADE;
CREATE UNIQUE INDEX chatbot_flows_pkey ON public.chatbot_flows USING btree (id);

DROP INDEX IF EXISTS public.idx_chatbot_flows_connection CASCADE;
CREATE INDEX idx_chatbot_flows_connection ON public.chatbot_flows USING btree (whatsapp_connection_id);

DROP INDEX IF EXISTS public.client_wallet_rules_pkey CASCADE;
CREATE UNIQUE INDEX client_wallet_rules_pkey ON public.client_wallet_rules USING btree (id);

DROP INDEX IF EXISTS public.idx_client_wallet_rules_priority CASCADE;
CREATE INDEX idx_client_wallet_rules_priority ON public.client_wallet_rules USING btree (priority DESC);

DROP INDEX IF EXISTS public.company_settings_pkey CASCADE;
CREATE UNIQUE INDEX company_settings_pkey ON public.company_settings USING btree (id);

DROP INDEX IF EXISTS public.company_settings_user_id_key CASCADE;
CREATE UNIQUE INDEX company_settings_user_id_key ON public.company_settings USING btree (user_id);

DROP INDEX IF EXISTS public.connection_queues_pkey CASCADE;
CREATE UNIQUE INDEX connection_queues_pkey ON public.connection_queues USING btree (id);

DROP INDEX IF EXISTS public.connection_queues_whatsapp_connection_id_queue_id_key CASCADE;
CREATE UNIQUE INDEX connection_queues_whatsapp_connection_id_queue_id_key ON public.connection_queues USING btree (whatsapp_connection_id, queue_id);

DROP INDEX IF EXISTS public.conversation_analyses_pkey CASCADE;
CREATE UNIQUE INDEX conversation_analyses_pkey ON public.conversation_analyses USING btree (id);

DROP INDEX IF EXISTS public.idx_conversation_analyses_contact CASCADE;
CREATE INDEX idx_conversation_analyses_contact ON public.conversation_analyses USING btree (contact_id);

DROP INDEX IF EXISTS public.idx_conversation_analyses_created_at CASCADE;
CREATE INDEX idx_conversation_analyses_created_at ON public.conversation_analyses USING btree (created_at DESC);

DROP INDEX IF EXISTS public.conversation_events_pkey CASCADE;
CREATE UNIQUE INDEX conversation_events_pkey ON public.conversation_events USING btree (id);

DROP INDEX IF EXISTS public.idx_conversation_events_contact CASCADE;
CREATE INDEX idx_conversation_events_contact ON public.conversation_events USING btree (contact_id);

DROP INDEX IF EXISTS public.idx_conversation_events_type CASCADE;
CREATE INDEX idx_conversation_events_type ON public.conversation_events USING btree (event_type);

DROP INDEX IF EXISTS public.conversation_tags_pkey CASCADE;
CREATE UNIQUE INDEX conversation_tags_pkey ON public.conversation_tags USING btree (id);

DROP INDEX IF EXISTS public.idx_conversation_tags_contact CASCADE;
CREATE INDEX idx_conversation_tags_contact ON public.conversation_tags USING btree (contact_id);

DROP INDEX IF EXISTS public.csat_surveys_pkey CASCADE;
CREATE UNIQUE INDEX csat_surveys_pkey ON public.csat_surveys USING btree (id);

DROP INDEX IF EXISTS public.idx_csat_surveys_agent CASCADE;
CREATE INDEX idx_csat_surveys_agent ON public.csat_surveys USING btree (agent_id);

DROP INDEX IF EXISTS public.idx_csat_surveys_created_at CASCADE;
CREATE INDEX idx_csat_surveys_created_at ON public.csat_surveys USING btree (created_at DESC);

DROP INDEX IF EXISTS public.custom_commands_pkey CASCADE;
CREATE UNIQUE INDEX custom_commands_pkey ON public.custom_commands USING btree (id);

DROP INDEX IF EXISTS public.idx_custom_commands_created_by CASCADE;
CREATE INDEX idx_custom_commands_created_by ON public.custom_commands USING btree (created_by);

DROP INDEX IF EXISTS public.deals_pkey CASCADE;
CREATE UNIQUE INDEX deals_pkey ON public.deals USING btree (id);

DROP INDEX IF EXISTS public.idx_deals_pipeline CASCADE;
CREATE INDEX idx_deals_pipeline ON public.deals USING btree (pipeline_id);

DROP INDEX IF EXISTS public.idx_deals_stage CASCADE;
CREATE INDEX idx_deals_stage ON public.deals USING btree (stage_id);

DROP INDEX IF EXISTS public.email_templates_pkey CASCADE;
CREATE UNIQUE INDEX email_templates_pkey ON public.email_templates USING btree (id);

DROP INDEX IF EXISTS public.idx_email_templates_category CASCADE;
CREATE INDEX idx_email_templates_category ON public.email_templates USING btree (category);

DROP INDEX IF EXISTS public.geo_blocking_settings_pkey CASCADE;
CREATE UNIQUE INDEX geo_blocking_settings_pkey ON public.geo_blocking_settings USING btree (id);

DROP INDEX IF EXISTS public.global_settings_pkey CASCADE;
CREATE UNIQUE INDEX global_settings_pkey ON public.global_settings USING btree (id);

DROP INDEX IF EXISTS public.gmail_accounts_pkey CASCADE;
CREATE UNIQUE INDEX gmail_accounts_pkey ON public.gmail_accounts USING btree (id);

DROP INDEX IF EXISTS public.idx_gmail_accounts_user CASCADE;
CREATE INDEX idx_gmail_accounts_user ON public.gmail_accounts USING btree (user_id);

DROP INDEX IF EXISTS public.gmail_email_attachments_pkey CASCADE;
CREATE UNIQUE INDEX gmail_email_attachments_pkey ON public.gmail_email_attachments USING btree (id);

DROP INDEX IF EXISTS public.idx_gmail_attachments_email CASCADE;
CREATE INDEX idx_gmail_attachments_email ON public.gmail_email_attachments USING btree (email_id);

DROP INDEX IF EXISTS public.gmail_email_labels_pkey CASCADE;
CREATE UNIQUE INDEX gmail_email_labels_pkey ON public.gmail_email_labels USING btree (id);

DROP INDEX IF EXISTS public.gmail_emails_pkey CASCADE;
CREATE UNIQUE INDEX gmail_emails_pkey ON public.gmail_emails USING btree (id);

DROP INDEX IF EXISTS public.idx_gmail_emails_account CASCADE;
CREATE INDEX idx_gmail_emails_account ON public.gmail_emails USING btree (account_id);

DROP INDEX IF EXISTS public.idx_gmail_emails_gmail_id CASCADE;
CREATE INDEX idx_gmail_emails_gmail_id ON public.gmail_emails USING btree (gmail_id);

DROP INDEX IF EXISTS public.idx_gmail_emails_thread CASCADE;
CREATE INDEX idx_gmail_emails_thread ON public.gmail_emails USING btree (thread_id);

DROP INDEX IF EXISTS public.idx_gmail_emails_received_at CASCADE;
CREATE INDEX idx_gmail_emails_received_at ON public.gmail_emails USING btree (received_at DESC);

DROP INDEX IF EXISTS public.gmail_sync_logs_pkey CASCADE;
CREATE UNIQUE INDEX gmail_sync_logs_pkey ON public.gmail_sync_logs USING btree (id);

DROP INDEX IF EXISTS public.idx_gmail_sync_logs_account CASCADE;
CREATE INDEX idx_gmail_sync_logs_account ON public.gmail_sync_logs USING btree (account_id);

DROP INDEX IF EXISTS public.invite_codes_pkey CASCADE;
CREATE UNIQUE INDEX invite_codes_pkey ON public.invite_codes USING btree (id);

DROP INDEX IF EXISTS public.invite_codes_code_key CASCADE;
CREATE UNIQUE INDEX invite_codes_code_key ON public.invite_codes USING btree (code);

DROP INDEX IF EXISTS public.ip_whitelist_pkey CASCADE;
CREATE UNIQUE INDEX ip_whitelist_pkey ON public.ip_whitelist USING btree (id);

DROP INDEX IF EXISTS public.ip_whitelist_ip_address_key CASCADE;
CREATE UNIQUE INDEX ip_whitelist_ip_address_key ON public.ip_whitelist USING btree (ip_address);

DROP INDEX IF EXISTS public.knowledge_base_articles_pkey CASCADE;
CREATE UNIQUE INDEX knowledge_base_articles_pkey ON public.knowledge_base_articles USING btree (id);

DROP INDEX IF EXISTS public.idx_kb_articles_category CASCADE;
CREATE INDEX idx_kb_articles_category ON public.knowledge_base_articles USING btree (category);

DROP INDEX IF EXISTS public.idx_kb_articles_search CASCADE;
CREATE INDEX idx_kb_articles_search ON public.knowledge_base_articles USING gin (search_vector);

DROP INDEX IF EXISTS public.leaderboard_entries_pkey CASCADE;
CREATE UNIQUE INDEX leaderboard_entries_pkey ON public.leaderboard_entries USING btree (id);

DROP INDEX IF EXISTS public.leaderboard_entries_profile_id_period_key CASCADE;
CREATE UNIQUE INDEX leaderboard_entries_profile_id_period_key ON public.leaderboard_entries USING btree (profile_id, period);

DROP INDEX IF EXISTS public.login_attempts_pkey CASCADE;
CREATE UNIQUE INDEX login_attempts_pkey ON public.login_attempts USING btree (id);

DROP INDEX IF EXISTS public.login_attempts_email_key CASCADE;
CREATE UNIQUE INDEX login_attempts_email_key ON public.login_attempts USING btree (email);

DROP INDEX IF EXISTS public.idx_login_attempts_email CASCADE;
CREATE INDEX idx_login_attempts_email ON public.login_attempts USING btree (email);

DROP INDEX IF EXISTS public.idx_login_attempts_locked CASCADE;
CREATE INDEX idx_login_attempts_locked ON public.login_attempts USING btree (locked_until);

DROP INDEX IF EXISTS public.messages_pkey CASCADE;
CREATE UNIQUE INDEX messages_pkey ON public.messages USING btree (id);

DROP INDEX IF EXISTS public.idx_messages_agent CASCADE;
CREATE INDEX idx_messages_agent ON public.messages USING btree (agent_id);

DROP INDEX IF EXISTS public.idx_messages_contact CASCADE;
CREATE INDEX idx_messages_contact ON public.messages USING btree (contact_id);

DROP INDEX IF EXISTS public.idx_messages_contact_created CASCADE;
CREATE INDEX idx_messages_contact_created ON public.messages USING btree (contact_id, created_at DESC);

DROP INDEX IF EXISTS public.idx_messages_created_at CASCADE;
CREATE INDEX idx_messages_created_at ON public.messages USING btree (created_at DESC);

DROP INDEX IF EXISTS public.idx_messages_status CASCADE;
CREATE INDEX idx_messages_status ON public.messages USING btree (status);

DROP INDEX IF EXISTS public.nps_responses_pkey CASCADE;
CREATE UNIQUE INDEX nps_responses_pkey ON public.nps_responses USING btree (id);

DROP INDEX IF EXISTS public.idx_nps_responses_contact CASCADE;
CREATE INDEX idx_nps_responses_contact ON public.nps_responses USING btree (contact_id);

DROP INDEX IF EXISTS public.idx_nps_responses_created_at CASCADE;
CREATE INDEX idx_nps_responses_created_at ON public.nps_responses USING btree (created_at DESC);

DROP INDEX IF EXISTS public.password_reset_requests_pkey CASCADE;
CREATE UNIQUE INDEX password_reset_requests_pkey ON public.password_reset_requests USING btree (id);

DROP INDEX IF EXISTS public.idx_password_reset_email CASCADE;
CREATE INDEX idx_password_reset_email ON public.password_reset_requests USING btree (email);

DROP INDEX IF EXISTS public.idx_password_reset_status CASCADE;
CREATE INDEX idx_password_reset_status ON public.password_reset_requests USING btree (status);

DROP INDEX IF EXISTS public.idx_password_reset_token CASCADE;
CREATE INDEX idx_password_reset_token ON public.password_reset_requests USING btree (reset_token);

DROP INDEX IF EXISTS public.permissions_pkey CASCADE;
CREATE UNIQUE INDEX permissions_pkey ON public.permissions USING btree (id);

DROP INDEX IF EXISTS public.permissions_name_key CASCADE;
CREATE UNIQUE INDEX permissions_name_key ON public.permissions USING btree (name);

DROP INDEX IF EXISTS public.pipeline_stages_pkey CASCADE;
CREATE UNIQUE INDEX pipeline_stages_pkey ON public.pipeline_stages USING btree (id);

DROP INDEX IF EXISTS public.idx_pipeline_stages_pipeline CASCADE;
CREATE INDEX idx_pipeline_stages_pipeline ON public.pipeline_stages USING btree (pipeline_id);

DROP INDEX IF EXISTS public.idx_pipeline_stages_position CASCADE;
CREATE INDEX idx_pipeline_stages_position ON public.pipeline_stages USING btree (pipeline_id, position);

DROP INDEX IF EXISTS public.pipelines_pkey CASCADE;
CREATE UNIQUE INDEX pipelines_pkey ON public.pipelines USING btree (id);

DROP INDEX IF EXISTS public.idx_pipelines_created_by CASCADE;
CREATE INDEX idx_pipelines_created_by ON public.pipelines USING btree (created_by);

DROP INDEX IF EXISTS public.profiles_pkey CASCADE;
CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

DROP INDEX IF EXISTS public.profiles_user_id_key CASCADE;
CREATE UNIQUE INDEX profiles_user_id_key ON public.profiles USING btree (user_id);

DROP INDEX IF EXISTS public.idx_profiles_email CASCADE;
CREATE INDEX idx_profiles_email ON public.profiles USING btree (email);

DROP INDEX IF EXISTS public.idx_profiles_is_active CASCADE;
CREATE INDEX idx_profiles_is_active ON public.profiles USING btree (is_active);

DROP INDEX IF EXISTS public.idx_profiles_name CASCADE;
CREATE INDEX idx_profiles_name ON public.profiles USING btree (name);

DROP INDEX IF EXISTS public.idx_profiles_role CASCADE;
CREATE INDEX idx_profiles_role ON public.profiles USING btree (role);

DROP INDEX IF EXISTS public.idx_profiles_user_id CASCADE;
CREATE INDEX idx_profiles_user_id ON public.profiles USING btree (user_id);

DROP INDEX IF EXISTS public.queue_members_pkey CASCADE;
CREATE UNIQUE INDEX queue_members_pkey ON public.queue_members USING btree (id);

DROP INDEX IF EXISTS public.queue_members_profile_id_queue_id_key CASCADE;
CREATE UNIQUE INDEX queue_members_profile_id_queue_id_key ON public.queue_members USING btree (profile_id, queue_id);

DROP INDEX IF EXISTS public.idx_queue_members_profile CASCADE;
CREATE INDEX idx_queue_members_profile ON public.queue_members USING btree (profile_id);

DROP INDEX IF EXISTS public.idx_queue_members_queue CASCADE;
CREATE INDEX idx_queue_members_queue ON public.queue_members USING btree (queue_id);

DROP INDEX IF EXISTS public.queue_skill_requirements_pkey CASCADE;
CREATE UNIQUE INDEX queue_skill_requirements_pkey ON public.queue_skill_requirements USING btree (id);

DROP INDEX IF EXISTS public.queue_skill_requirements_queue_id_skill_name_key CASCADE;
CREATE UNIQUE INDEX queue_skill_requirements_queue_id_skill_name_key ON public.queue_skill_requirements USING btree (queue_id, skill_name);

DROP INDEX IF EXISTS public.queues_pkey CASCADE;
CREATE UNIQUE INDEX queues_pkey ON public.queues USING btree (id);

DROP INDEX IF EXISTS public.idx_queues_created_by CASCADE;
CREATE INDEX idx_queues_created_by ON public.queues USING btree (created_by);

DROP INDEX IF EXISTS public.role_permissions_pkey CASCADE;
CREATE UNIQUE INDEX role_permissions_pkey ON public.role_permissions USING btree (id);

DROP INDEX IF EXISTS public.role_permissions_role_permission_id_key CASCADE;
CREATE UNIQUE INDEX role_permissions_role_permission_id_key ON public.role_permissions USING btree (role, permission_id);

DROP INDEX IF EXISTS public.saved_filters_pkey CASCADE;
CREATE UNIQUE INDEX saved_filters_pkey ON public.saved_filters USING btree (id);

DROP INDEX IF EXISTS public.idx_saved_filters_user CASCADE;
CREATE INDEX idx_saved_filters_user ON public.saved_filters USING btree (user_id);

DROP INDEX IF EXISTS public.service_accounts_pkey CASCADE;
CREATE UNIQUE INDEX service_accounts_pkey ON public.service_accounts USING btree (id);

DROP INDEX IF EXISTS public.service_accounts_provider_account_id_key CASCADE;
CREATE UNIQUE INDEX service_accounts_provider_account_id_key ON public.service_accounts USING btree (provider, account_id);

DROP INDEX IF EXISTS public.sicoob_gift_redeems_pkey CASCADE;
CREATE UNIQUE INDEX sicoob_gift_redeems_pkey ON public.sicoob_gift_redeems USING btree (id);

DROP INDEX IF EXISTS public.idx_sicoob_redeems_contact CASCADE;
CREATE INDEX idx_sicoob_redeems_contact ON public.sicoob_gift_redeems USING btree (contact_id);

DROP INDEX IF EXISTS public.idx_sicoob_redeems_status CASCADE;
CREATE INDEX idx_sicoob_redeems_status ON public.sicoob_gift_redeems USING btree (status);

DROP INDEX IF EXISTS public.sla_configurations_pkey CASCADE;
CREATE UNIQUE INDEX sla_configurations_pkey ON public.sla_configurations USING btree (id);

DROP INDEX IF EXISTS public.idx_sla_config_queue CASCADE;
CREATE INDEX idx_sla_config_queue ON public.sla_configurations USING btree (queue_id);

DROP INDEX IF EXISTS public.sla_violations_pkey CASCADE;
CREATE UNIQUE INDEX sla_violations_pkey ON public.sla_violations USING btree (id);

DROP INDEX IF EXISTS public.idx_sla_violations_contact CASCADE;
CREATE INDEX idx_sla_violations_contact ON public.sla_violations USING btree (contact_id);

DROP INDEX IF EXISTS public.idx_sla_violations_resolved CASCADE;
CREATE INDEX idx_sla_violations_resolved ON public.sla_violations USING btree (resolved_at);

DROP INDEX IF EXISTS public.sticker_packs_pkey CASCADE;
CREATE UNIQUE INDEX sticker_packs_pkey ON public.sticker_packs USING btree (id);

DROP INDEX IF EXISTS public.idx_sticker_packs_created_by CASCADE;
CREATE INDEX idx_sticker_packs_created_by ON public.sticker_packs USING btree (created_by);

DROP INDEX IF EXISTS public.tag_groups_pkey CASCADE;
CREATE UNIQUE INDEX tag_groups_pkey ON public.tag_groups USING btree (id);

DROP INDEX IF EXISTS public.idx_tag_groups_created_by CASCADE;
CREATE INDEX idx_tag_groups_created_by ON public.tag_groups USING btree (created_by);

DROP INDEX IF EXISTS public.tags_pkey CASCADE;
CREATE UNIQUE INDEX tags_pkey ON public.tags USING btree (id);

DROP INDEX IF EXISTS public.tags_name_key CASCADE;
CREATE UNIQUE INDEX tags_name_key ON public.tags USING btree (name);

DROP INDEX IF EXISTS public.idx_tags_group CASCADE;
CREATE INDEX idx_tags_group ON public.tags USING btree (group_id);

DROP INDEX IF EXISTS public.team_chat_files_pkey CASCADE;
CREATE UNIQUE INDEX team_chat_files_pkey ON public.team_chat_files USING btree (id);

DROP INDEX IF EXISTS public.idx_team_chat_files_message CASCADE;
CREATE INDEX idx_team_chat_files_message ON public.team_chat_files USING btree (message_id);

DROP INDEX IF EXISTS public.team_chat_messages_pkey CASCADE;
CREATE UNIQUE INDEX team_chat_messages_pkey ON public.team_chat_messages USING btree (id);

DROP INDEX IF EXISTS public.idx_team_chat_conversation CASCADE;
CREATE INDEX idx_team_chat_conversation ON public.team_chat_messages USING btree (conversation_id);

DROP INDEX IF EXISTS public.idx_team_chat_sender CASCADE;
CREATE INDEX idx_team_chat_sender ON public.team_chat_messages USING btree (sender_id);

DROP INDEX IF EXISTS public.idx_team_chat_timestamp CASCADE;
CREATE INDEX idx_team_chat_timestamp ON public.team_chat_messages USING btree (created_at DESC);

DROP INDEX IF EXISTS public.team_conversation_members_pkey CASCADE;
CREATE UNIQUE INDEX team_conversation_members_pkey ON public.team_conversation_members USING btree (id);

DROP INDEX IF EXISTS public.team_conversation_members_conversation_id_profile_id_key CASCADE;
CREATE UNIQUE INDEX team_conversation_members_conversation_id_profile_id_key ON public.team_conversation_members USING btree (conversation_id, profile_id);

DROP INDEX IF EXISTS public.team_conversations_pkey CASCADE;
CREATE UNIQUE INDEX team_conversations_pkey ON public.team_conversations USING btree (id);

DROP INDEX IF EXISTS public.idx_team_conversations_created_by CASCADE;
CREATE INDEX idx_team_conversations_created_by ON public.team_conversations USING btree (created_by);

DROP INDEX IF EXISTS public.user_devices_pkey CASCADE;
CREATE UNIQUE INDEX user_devices_pkey ON public.user_devices USING btree (id);

DROP INDEX IF EXISTS public.user_devices_user_id_fingerprint_key CASCADE;
CREATE UNIQUE INDEX user_devices_user_id_fingerprint_key ON public.user_devices USING btree (user_id, fingerprint);

DROP INDEX IF EXISTS public.idx_user_devices_user CASCADE;
CREATE INDEX idx_user_devices_user ON public.user_devices USING btree (user_id);

DROP INDEX IF EXISTS public.user_roles_pkey CASCADE;
CREATE UNIQUE INDEX user_roles_pkey ON public.user_roles USING btree (id);

DROP INDEX IF EXISTS public.user_roles_user_id_role_key CASCADE;
CREATE UNIQUE INDEX user_roles_user_id_role_key ON public.user_roles USING btree (user_id, role);

DROP INDEX IF EXISTS public.idx_user_roles_role CASCADE;
CREATE INDEX idx_user_roles_role ON public.user_roles USING btree (role);

DROP INDEX IF EXISTS public.idx_user_roles_user CASCADE;
CREATE INDEX idx_user_roles_user ON public.user_roles USING btree (user_id);

DROP INDEX IF EXISTS public.users_email_idx CASCADE;
CREATE INDEX users_email_idx ON public.users USING btree (email);

DROP INDEX IF EXISTS public.users_phone_idx CASCADE;
CREATE INDEX users_phone_idx ON public.users USING btree (phone);

DROP INDEX IF EXISTS public.users_pkey CASCADE;
CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

DROP INDEX IF EXISTS public.idx_webhook_logs_created_at CASCADE;
CREATE INDEX idx_webhook_logs_created_at ON public.webhook_logs USING btree (created_at DESC);

DROP INDEX IF EXISTS public.idx_webhook_logs_event CASCADE;
CREATE INDEX idx_webhook_logs_event ON public.webhook_logs USING btree (event_type);

DROP INDEX IF EXISTS public.idx_webhook_logs_status CASCADE;
CREATE INDEX idx_webhook_logs_status ON public.webhook_logs USING btree (status);

DROP INDEX IF EXISTS public.webhook_logs_pkey CASCADE;
CREATE UNIQUE INDEX webhook_logs_pkey ON public.webhook_logs USING btree (id);

DROP INDEX IF EXISTS public.webauthn_challenges_pkey CASCADE;
CREATE UNIQUE INDEX webauthn_challenges_pkey ON public.webauthn_challenges USING btree (id);

DROP INDEX IF EXISTS public.webauthn_credentials_pkey CASCADE;
CREATE UNIQUE INDEX webauthn_credentials_pkey ON public.webauthn_credentials USING btree (id);

DROP INDEX IF EXISTS public.webauthn_credentials_user_id_credential_id_key CASCADE;
CREATE UNIQUE INDEX webauthn_credentials_user_id_credential_id_key ON public.webauthn_credentials USING btree (user_id, credential_id);

DROP INDEX IF EXISTS public.whatsapp_connections_pkey CASCADE;
CREATE UNIQUE INDEX whatsapp_connections_pkey ON public.whatsapp_connections USING btree (id);

DROP INDEX IF EXISTS public.idx_whatsapp_connections_instance CASCADE;
CREATE INDEX idx_whatsapp_connections_instance ON public.whatsapp_connections USING btree (instance_id);

DROP INDEX IF EXISTS public.idx_whatsapp_connections_status CASCADE;
CREATE INDEX idx_whatsapp_connections_status ON public.whatsapp_connections USING btree (status);

DROP INDEX IF EXISTS public.idx_whatsapp_connections_user CASCADE;
CREATE INDEX idx_whatsapp_connections_user ON public.whatsapp_connections USING btree (user_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- FIM DO BLOCO 6 — 293 índices exportados
-- ═══════════════════════════════════════════════════════════════════════════════
