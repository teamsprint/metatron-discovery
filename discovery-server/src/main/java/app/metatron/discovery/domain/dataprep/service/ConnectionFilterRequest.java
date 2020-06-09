/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package app.metatron.discovery.domain.dataprep.service;

import java.util.List;
import app.metatron.discovery.common.criteria.ListFilterRequest;

public class ConnectionFilterRequest extends ListFilterRequest {
    List<String> implementor;

    public List<String> getImplementor() {
        return implementor;
    }

    public void setImplementor(List<String> implementor) {
        this.implementor = implementor;
    }
}
