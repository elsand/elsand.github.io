---
menutitle: Oversikt
title: Pågående arbeider
layout: home
---


{%- assign default_paths = site.pages | map: "path" -%}
{%- assign page_paths = site.header_pages | default: default_paths -%}

{%- if page_paths -%}
    {%- for path in page_paths -%}
        {%- assign my_page = site.pages | where: "path", path | first -%}
        {%- if my_page.menutitle != "Oversikt" -%}
            <a class="page-link" href="{{ my_page.url | relative_url }}">{{ my_page.menutitle | escape }}</a><br>
        {%- endif -%}
    {%- endfor -%}
{%- endif -%}

