<?php
/**
 * Plugin Name: MiniFanzo Homepage Settings
 * Description: Custom homepage content management for MiniFanzo Next.js site
 * Version: 1.0
 * Author: MiniFanzo
 */

if (!defined('ABSPATH')) exit;

class Minifanzo_Homepage_Settings {
    
    public function __construct() {
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_init', [$this, 'register_settings']);
        add_action('rest_api_init', [$this, 'register_rest_route']);
    }

    public function add_admin_menu() {
        add_menu_page(
            'Homepage Settings',
            'Homepage',
            'manage_options',
            'minifanzo-homepage',
            [$this, 'settings_page'],
            'dashicons-admin-generic',
            30
        );
    }

    public function register_settings() {
        register_setting('minifanzo_homepage', 'mfz_hero');
        register_setting('minifanzo_homepage', 'mfz_discount');
        register_setting('minifanzo_homepage', 'mfz_about');
        register_setting('minifanzo_homepage', 'mfz_stats');
        register_setting('minifanzo_homepage', 'mfz_logo');
    }

    public function register_rest_route() {
        register_rest_route('minifanzo/v1', '/homepage', [
            'methods' => 'GET',
            'callback' => [$this, 'get_homepage_data'],
            'permission_callback' => '__return_true'
        ]);
    }

    public function get_homepage_data() {
        return [
            'hero' => get_option('mfz_hero', []),
            'discount' => get_option('mfz_discount', []),
            'about' => get_option('mfz_about', []),
            'stats' => get_option('mfz_stats', []),
            'logo' => get_option('mfz_logo', []),
        ];
    }

    public function settings_page() {
        ?>
        <div class="wrap">
            <h1>MiniFanzo Homepage Settings</h1>
            <form method="post" action="options.php">
                <?php settings_fields('minifanzo_homepage'); ?>
                
                <!-- Hero Section -->
                <div class="card" style="max-width:800px;margin-top:20px;padding:20px">
                    <h2>Hero Section</h2>
                    <table class="form-table">
                        <tr>
                            <th>Subtitle</th>
                            <td><input type="text" name="mfz_hero[subtitle]" value="<?php echo esc_attr(get_option('mfz_hero')['subtitle'] ?? ''); ?>" class="regular-text"></td>
                        </tr>
                        <tr>
                            <th>Title</th>
                            <td><textarea name="mfz_hero[title]" rows="3" class="regular-text"><?php echo esc_attr(get_option('mfz_hero')['title'] ?? ''); ?></textarea></td>
                        </tr>
                        <tr>
                            <th>Description</th>
                            <td><textarea name="mfz_hero[description]" rows="3" class="regular-text"><?php echo esc_attr(get_option('mfz_hero')['description'] ?? ''); ?></textarea></td>
                        </tr>
                        <tr>
                            <th>Image URL</th>
                            <td><input type="url" name="mfz_hero[image]" value="<?php echo esc_attr(get_option('mfz_hero')['image'] ?? ''); ?>" class="regular-text"></td>
                        </tr>
                    </table>
                </div>

                <!-- Discount Section -->
                <div class="card" style="max-width:800px;margin-top:20px;padding:20px">
                    <h2>Discount/Promo Section</h2>
                    <table class="form-table">
                        <tr>
                            <th>Title</th>
                            <td><input type="text" name="mfz_discount[title]" value="<?php echo esc_attr(get_option('mfz_discount')['title'] ?? ''); ?>" class="regular-text"></td>
                        </tr>
                        <tr>
                            <th>Description</th>
                            <td><textarea name="mfz_discount[description]" rows="3" class="regular-text"><?php echo esc_attr(get_option('mfz_discount')['description'] ?? ''); ?></textarea></td>
                        </tr>
                        <tr>
                            <th>Image URL</th>
                            <td><input type="url" name="mfz_discount[image]" value="<?php echo esc_attr(get_option('mfz_discount')['image'] ?? ''); ?>" class="regular-text"></td>
                        </tr>
                    </table>
                </div>

                <!-- About Section -->
                <div class="card" style="max-width:800px;margin-top:20px;padding:20px">
                    <h2>About Section</h2>
                    <table class="form-table">
                        <tr>
                            <th>Content (HTML allowed)</th>
                            <td><textarea name="mfz_about[content]" rows="6" class="large-text"><?php echo esc_attr(get_option('mfz_about')['content'] ?? ''); ?></textarea></td>
                        </tr>
                        <tr>
                            <th>Image 1 URL</th>
                            <td><input type="url" name="mfz_about[image_1]" value="<?php echo esc_attr(get_option('mfz_about')['image_1'] ?? ''); ?>" class="regular-text"></td>
                        </tr>
                        <tr>
                            <th>Image 2 URL</th>
                            <td><input type="url" name="mfz_about[image_2]" value="<?php echo esc_attr(get_option('mfz_about')['image_2'] ?? ''); ?>" class="regular-text"></td>
                        </tr>
                        <tr>
                            <th>Badge Text</th>
                            <td><input type="text" name="mfz_about[badge_text]" value="<?php echo esc_attr(get_option('mfz_about')['badge_text'] ?? ''); ?>" class="regular-text"></td>
                        </tr>
                    </table>
                </div>

                <!-- Stats Section -->
                <div class="card" style="max-width:800px;margin-top:20px;padding:20px">
                    <h2>Stats Section</h2>
                    <table class="form-table">
                        <tr>
                            <th>Customers Count</th>
                            <td><input type="text" name="mfz_stats[customers]" value="<?php echo esc_attr(get_option('mfz_stats')['customers'] ?? ''); ?>" class="regular-text"></td>
                        </tr>
                        <tr>
                            <th>Products Count</th>
                            <td><input type="text" name="mfz_stats[products]" value="<?php echo esc_attr(get_option('mfz_stats')['products'] ?? ''); ?>" class="regular-text"></td>
                        </tr>
                        <tr>
                            <th>Rating</th>
                            <td><input type="text" name="mfz_stats[rating]" value="<?php echo esc_attr(get_option('mfz_stats')['rating'] ?? ''); ?>" class="regular-text"></td>
                        </tr>
                    </table>
                </div>

                <!-- Logo Section -->
                <div class="card" style="max-width:800px;margin-top:20px;padding:20px">
                    <h2>Logo</h2>
                    <table class="form-table">
                        <tr>
                            <th>Website Logo URL</th>
                            <td>
                                <input type="url" name="mfz_logo[url]" value="<?php echo esc_attr(get_option('mfz_logo')['url'] ?? ''); ?>" class="regular-text" placeholder="https://example.com/logo.png">
                                <p class="description">Upload your logo to WordPress Media Library and paste the URL here</p>
                            </td>
                        </tr>
                    </table>
                </div>

                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }
}

new Minifanzo_Homepage_Settings();