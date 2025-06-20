beforeEach(() => {
    cy.resetDatabase();
    cy.clearBrowserStorage();
    cy.loginUser();
    cy.visitNewPageEditor();
    cy.addBlock('kevinbatdorf/code-block-pro');
    cy.findBlock('code-block-pro').should('exist');

    cy.focusBlock(
        'code-block-pro',
        'textarea.npm__react-simple-code-editor__textarea',
    );
    cy.findBlock(
        'code-block-pro',
        'textarea.npm__react-simple-code-editor__textarea',
    ).should('have.focus');
});
afterEach(() => {
    cy.saveDraft(); // so we can leave without an alert
    cy.logoutUser();
});
context('Extra Settings', () => {
    it('Disallows &lt;', () => {
        cy.openSideBarPanel('Extra Settings');

        cy.get('[data-cy="use-decode-uri"]')
            .should('exist')
            .should('not.be.checked');

        cy.addCode('<script>&lt;</script>', {
            codeOutput: '<script><</script>',
        });

        cy.findBlock('code-block-pro', '> div > div > pre')
            .invoke('html')
            .should('not.contain', encodeURI('<'));

        cy.previewCurrentPage();

        cy.get('.wp-block-kevinbatdorf-code-block-pro pre.shiki')
            .should('exist')
            .should('contain', '<script><</script>');
    });

    it('Allows &lt; when checked', () => {
        cy.openSideBarPanel('Extra Settings');

        cy.get('[data-cy="use-decode-uri"]').check();

        cy.addCode('<script>&lt;</script>');

        cy.findBlock('code-block-pro', '> div > div > pre')
            .invoke('html')
            .should('contain', '>lt</span>'); // formatted with highlighter

        cy.previewCurrentPage();

        cy.get('.wp-block-kevinbatdorf-code-block-pro pre.shiki')
            .should('exist')
            .should('contain', '<script>&lt;</script>');
    });

    it('Escapes WordPress shortcodes', () => {
        cy.openSideBarPanel('Extra Settings');
        cy.get('[data-cy="use-escape-shortcodes"]')
            .should('exist')
            .should('not.be.checked');

        cy.setLanguage('plaintext');
        cy.addCode('[embed]foo[/embed]');
        cy.findBlock('code-block-pro', '> div > div > pre')
            .invoke('html')
            .should('contain', '[embed]foo[/embed]'); // Doesn't render

        cy.previewCurrentPage();
        cy.get('.wp-block-kevinbatdorf-code-block-pro pre.shiki')
            .should('exist')
            .invoke('html')
            .should('contain', '<a href="http://foo">foo</a>'); // Renders

        cy.go('back');
        cy.focusBlock('code-block-pro');
        cy.openSideBarPanel('Extra Settings');
        cy.get('[data-cy="use-escape-shortcodes"]').check();
        cy.findBlock('code-block-pro', '> div > div > pre')
            .invoke('html')
            .should('contain', '[embed]foo[/embed]'); // Doesn't render

        cy.previewCurrentPage();
        cy.get('.wp-block-kevinbatdorf-code-block-pro pre.shiki')
            .should('exist')
            .invoke('html')
            .should('contain', '[embed]foo[/embed]'); // Doesn't render
    });
});
