<?php

    function public_path($path=null)
    {
            return rtrim(app()->basePath('public/'.$path), '/');
    }