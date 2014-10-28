var LineBuffer = function() {
    this.lines = [];
    this.ensureEmpty = false;
};

LineBuffer.prototype.add = function(line) {
    // If the ensure empty line flag is set and the line currently being added
    // is itself non-empty, push a newline beforehand.
    if (line !== '' && this.ensureEmpty) {
        this.newline();
    }

    this.lines.push(line);

    return this;
};

LineBuffer.prototype.newline = function() {
    this.lines.push('');

    // Clear the ensure empty line flag; we have one now.
    if (this.ensureEmpty) {
        this.ensureEmpty = false;
    }

    return this;
};

LineBuffer.prototype.ensureEmptyLine = function() {
    this.ensureEmpty = true;
    return this;
};

LineBuffer.prototype.string = function() {
    return this.lines.join('\n');
};

function bufferTagIfExists(buffer, spec, tag, label) {
    if (spec.tags.hasOwnProperty(tag)) {
        var value = spec.tags[tag];
        if (value !== null) {
            if ((typeof value === 'string' && value.length > 0) ||
                typeof value === 'number') {
                buffer.add(label + ': ' + value);
            }
        }
    }
}

function bufferScriptBlock(buffer, arr, keyword, hideIfEmpty) {
    var i;

    if (hideIfEmpty && arr.length === 0) {
        return;
    }

    buffer.add(keyword);
    for (i = 0; i < arr.length; i++) {
        buffer.add(arr[i]);
    }
}

module.exports = function(spec, callback) {
    var buffer = new LineBuffer(),
        i;

    buffer
        .add('Name: ' + spec.tags.name)
        .add('Version: ' + spec.tags.version)
        .add('Release: ' + spec.tags.release);

    bufferTagIfExists(buffer, spec, 'summary', 'Summary');
    bufferTagIfExists(buffer, spec, 'license', 'License');
    bufferTagIfExists(buffer, spec, 'epoch', 'Epoch');
    bufferTagIfExists(buffer, spec, 'distribution', 'Distribution');
    bufferTagIfExists(buffer, spec, 'icon', 'Icon');
    bufferTagIfExists(buffer, spec, 'vendor', 'Vendor');
    bufferTagIfExists(buffer, spec, 'url', 'URL');
    bufferTagIfExists(buffer, spec, 'group', 'Group');
    bufferTagIfExists(buffer, spec, 'packager', 'Packager');

    if (spec.tags.requires.length > 0) {
        buffer.add('Requires: ' + spec.tags.requires.join(', '));
    }

    if (spec.tags.conflicts.length > 0) {
        buffer.add('Conflicts: ' + spec.tags.conflicts.join(', '));
    }

    if (spec.tags.autoReq === false && spec.tags.autoProv === false) {
        buffer.add('AutoReqProv: no');
    } else if (spec.tags.autoReq === false) {
        buffer.add('AutoReq: no');
    } else if (spec.tags.autoProv === false) {
        buffer.add('AutoProv: no');
    }

    if (spec.tags.excludeArchs.length > 0) {
        buffer.add('ExcludeArch: ' + spec.tags.excludeArchs.join(', '));
    }

    if (spec.tags.exclusiveArchs.length > 0) {
        buffer.add('ExclusiveArch: ' + spec.tags.exclusiveArchs.join(', '));
    }

    if (spec.tags.excludeOS.length > 0) {
        buffer.add('ExcludeOS: ' + spec.tags.excludeOS.join(', '));
    }

    if (spec.tags.exclusiveOS.length > 0) {
        buffer.add('ExclusiveOS: ' + spec.tags.exclusiveOS.join(', '));
    }

    bufferTagIfExists(buffer, spec, 'prefix', 'Prefix');
    bufferTagIfExists(buffer, spec, 'buildRoot', 'BuildRoot');

    if (spec.tags.sources.length > 0) {
        if (spec.tags.sources.length === 1) {
            buffer.add('Source: ' + spec.tags.sources[0]);
        } else {
            for (i = 0; i < spec.tags.sources.length; i++) {
                buffer.add('Source' + i + ': ' + spec.tags.sources[i]);
            }
        }
    }

    if (spec.tags.noSources.length > 0) {
        buffer.add('NoSource: ' + spec.tags.noSources.join(', '));
    }

    if (spec.tags.patches.length > 0) {
        if (spec.tags.patches.length === 1) {
            buffer.add('Patch: ' + spec.tags.patches[0]);
        } else {
            for (i = 0; i < spec.tags.patches.length; i++) {
                buffer.add('Patch' + i + ': ' + spec.tags.patches[i]);
            }
        }
    }

    if (spec.tags.noPatches.length > 0) {
        buffer.add('NoPatch: ' + spec.tags.noPatches.join(', '));
    }

    buffer.ensureEmptyLine();

    if (spec.tags.description !== null && spec.tags.description.length > 0) {
        buffer
            .add('%description')
            .add(spec.tags.description);
    }

    // Script sections.
    buffer.ensureEmptyLine();
    bufferScriptBlock(buffer, spec.scripts.prep, '%prep', true);
    buffer.ensureEmptyLine();
    bufferScriptBlock(buffer, spec.scripts.build, '%build', true);
    buffer.ensureEmptyLine();
    bufferScriptBlock(buffer, spec.scripts.install, '%install', true);
    buffer.ensureEmptyLine();
    bufferScriptBlock(buffer, spec.scripts.check, '%check', true);
    buffer.ensureEmptyLine();
    bufferScriptBlock(buffer, spec.scripts.clean, '%clean', true);

    callback(buffer.string(), null);
};
