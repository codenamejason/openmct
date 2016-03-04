/*****************************************************************************
 * Open MCT Web, Copyright (c) 2014-2015, United States Government
 * as represented by the Administrator of the National Aeronautics and Space
 * Administration. All rights reserved.
 *
 * Open MCT Web is licensed under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * Open MCT Web includes source code licensed under additional open source
 * licenses. See the Open Source Licenses file (LICENSES.md) included with
 * this source code distribution or the Licensing information page available
 * at runtime from the About dialog for additional information.
 *****************************************************************************/

define(
    [
        "../../src/controllers/MCTTableController"
    ],
    function (MCTTableController) {

        describe('The MCTTable Controller', function() {

            var controller,
                mockScope,
                watches,
                mockTimeout,
                mockElement;

            beforeEach(function() {
                watches = {};

                mockScope = jasmine.createSpyObj('scope', [
                   '$watchCollection'
                ]);
                mockScope.$watchCollection.andCallFake(function(event, callback) {
                    watches[event] = callback;
                });

                mockElement = jasmine.createSpyObj('element', [
                    'find',
                    'on'
                ]);
                mockElement.find.andReturn(mockElement);

                mockScope.displayHeaders = true;
                mockTimeout = jasmine.createSpy('$timeout');

                controller = new MCTTableController(mockScope, mockTimeout, mockElement);
            });

            it('Reacts to changes to filters, headers, and rows', function() {
                expect(mockScope.$watchCollection).toHaveBeenCalledWith('filters', jasmine.any(Function));
                expect(mockScope.$watchCollection).toHaveBeenCalledWith('headers', jasmine.any(Function));
                expect(mockScope.$watchCollection).toHaveBeenCalledWith('rows', jasmine.any(Function));
            });

            describe('rows', function() {
                var testRows = [];
                beforeEach(function() {
                    testRows = [
                        {
                            'col1': {'text': 'row1 col1 match'},
                            'col2': {'text': 'def'},
                            'col3': {'text': 'row1 col3'}
                        },
                        {
                            'col1': {'text': 'row2 col1 match'},
                            'col2': {'text': 'abc'},
                            'col3': {'text': 'row2 col3'}
                        },
                        {
                            'col1': {'text': 'row3 col1'},
                            'col2': {'text': 'ghi'},
                            'col3': {'text': 'row3 col3'}
                        }
                    ];
                });

                it('Filters results based on filter input', function() {
                   var filters = {},
                       filteredRows;

                   mockScope.filters = filters;

                   filteredRows = controller.filterRows(testRows);
                   expect(filteredRows.length).toBe(3);
                   filters.col1 = 'row1';
                   filteredRows = controller.filterRows(testRows);
                   expect(filteredRows.length).toBe(1);
                   filters.col1 = 'match';
                   filteredRows = controller.filterRows(testRows);
                   expect(filteredRows.length).toBe(2);
                });

                it('Sets rows on scope when rows change', function() {
                    controller.updateRows(testRows);
                    expect(mockScope.displayRows.length).toBe(3);
                    expect(mockScope.displayRows).toEqual(testRows);
                });

                describe('sorting', function() {
                    var sortedRows;

                    it('Sorts rows ascending', function() {
                        mockScope.sortColumn = 'col1';
                        mockScope.sortDirection = 'asc';

                        sortedRows = controller.sortRows(testRows);
                        expect(sortedRows[0].col1.text).toEqual('row1 col1 match');
                        expect(sortedRows[1].col1.text).toEqual('row2 col1' +
                            ' match');
                        expect(sortedRows[2].col1.text).toEqual('row3 col1');

                    });

                    it('Sorts rows descending', function() {
                        mockScope.sortColumn = 'col1';
                        mockScope.sortDirection = 'desc';

                        sortedRows = controller.sortRows(testRows);
                        expect(sortedRows[0].col1.text).toEqual('row3 col1');
                        expect(sortedRows[1].col1.text).toEqual('row2 col1 match');
                        expect(sortedRows[2].col1.text).toEqual('row1 col1 match');
                    });
                    it('Sorts rows descending based on selected sort column', function() {
                        mockScope.sortColumn = 'col2';
                        mockScope.sortDirection = 'desc';

                        sortedRows = controller.sortRows(testRows);
                        expect(sortedRows[0].col2.text).toEqual('ghi');
                        expect(sortedRows[1].col2.text).toEqual('def');
                        expect(sortedRows[2].col2.text).toEqual('abc');
                    });
                });
            });
        });
    });
