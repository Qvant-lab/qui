<template>
  <div class="q-breadcrumbs">
    <template v-for="crumb in breadcrumbs">
      <component
        :is="linkComponent || 'router-link'"
        :key="crumb.name || crumb.path"
        :to="pushTo(crumb)"
        active-class="q-breadcrumbs__crumb_active"
        exact-active-class="q-breadcrumbs__crumb_exact-active"
        class="q-breadcrumbs__crumb"
      >
        {{ crumb.meta.breadcrumb }}
      </component>

      <span
        :key="`${crumb.name || crumb.path}divider`"
        class="q-breadcrumbs__divider q-icon-arrow-right"
      />
    </template>

    <div class="q-breadcrumbs__crumb q-breadcrumbs__crumb_last">
      {{ lastCrumb }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'QBreadcrumbs',
  componentName: 'QBreadcrumbs',

  /**
   * if you have vue router, QBreadcrumbs will get crumbs from this.$route.matched
   */
  props: {
    /**
     * component name for link
     */
    linkComponent: {
      type: String,
      default: null
    },
    /**
     * custom last crumb
     */
    last: {
      type: String,
      default: null
    },
    /**
     * Array of Objects, object must contain required fields: `path` - uses as route path, `name` - route name, `meta` - must contain `breadcrumb` - visible title
     */
    customRoutes: {
      type: Array,
      default: null
    }
  },

  computed: {
    crumbs() {
      const routes = this.customRoutes ?? this.$route.matched;

      return routes.filter(route => route.meta?.breadcrumb);
    },

    breadcrumbs() {
      const breadcrumbs = [...this.crumbs];
      breadcrumbs.pop();
      return breadcrumbs;
    },

    lastCrumb() {
      if (this.last) return this.last;

      return this.crumbs[this.crumbs.length - 1]?.meta.breadcrumb ?? '';
    }
  },

  methods: {
    pushTo({ name, path }) {
      return name ? { name } : path;
    }
  }
};
</script>
